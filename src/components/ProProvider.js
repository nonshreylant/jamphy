"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";

const ProContext = createContext({
  isPro: false,
  isProLoading: true,
  openUpgradeModal: () => {},
  closeUpgradeModal: () => {},
  requirePro: () => false,
});

const PRO_FEATURES = [
  {
    title: "Create Custom Tests",
    desc: "Build timed mock exams by year, subject, subtopic & question type.",
  },
  {
    title: "Live Study Rooms",
    desc: "Host & join real-time multiplayer mock sessions with friends.",
  },
  {
    title: "JAM & Personal Analytics",
    desc: "9-year exam trends, difficulty breakdowns & accuracy heatmaps.",
  },
  {
    title: "Year-wise PYQ Section",
    desc: "Browse & solve complete year-by-year IIT JAM question papers.",
  },
  {
    title: "All Advanced Filters",
    desc: "Filter by Year, Topic, Subtopic, Sub-subtopic, Difficulty & Type.",
  },
];

let razorpayScriptPromise = null;

function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        razorpayScriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
}

export function ProLockBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold tracking-wider uppercase shrink-0 ${className}`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      PRO
    </span>
  );
}

export function ProProvider({ children }) {
  const { data: session, status, update } = useSession();
  const [optimisticPro, setOptimisticPro] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featureLabel, setFeatureLabel] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const isPro = Boolean(session?.user?.isPro) || optimisticPro;
  const isProLoading = status === "loading";

  useEffect(() => {
    if (status === "unauthenticated") {
      setOptimisticPro(false);
    }
  }, [status]);

  const openUpgradeModal = useCallback((feature = "", onUnlocked = null) => {
    setFeatureLabel(feature);
    setErrorMessage("");
    setPaymentSuccess(false);
    setPendingAction(() => onUnlocked);
    setIsModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    if (isProcessing) return;
    setIsModalOpen(false);
    setErrorMessage("");
    setPaymentSuccess(false);
    setPendingAction(null);
  }, [isProcessing]);

  const requirePro = useCallback(
    (feature, callback) => {
      if (isPro) {
        if (typeof callback === "function") callback();
        return true;
      }
      if (status === "unauthenticated") {
        signIn("google");
        return false;
      }
      openUpgradeModal(feature, callback);
      return false;
    },
    [isPro, status, openUpgradeModal]
  );

  const handleCheckout = async () => {
    if (status !== "authenticated" || !session?.user) {
      signIn("google");
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Could not load Razorpay Checkout. Please check your internet connection.");
      }

      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Unable to create payment order.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Jamphy",
        description: "Jamphy Pro Pass — Lifetime Access",
        image: "/faviconnew.png",
        order_id: orderData.orderId,
        prefill: {
          name: orderData.user?.name || session.user.name || "",
          email: orderData.user?.email || session.user.email || "",
        },
        theme: {
          color: "#18181b",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            setOptimisticPro(true);
            await update();
            setPaymentSuccess(true);
            setIsProcessing(false);

            const actionToRun = pendingAction;
            setTimeout(() => {
              setIsModalOpen(false);
              setPaymentSuccess(false);
              setPendingAction(null);
              if (typeof actionToRun === "function") {
                actionToRun();
              }
            }, 1400);
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setErrorMessage(
              verifyErr.message || "Payment captured, but verification failed. Please refresh."
            );
            setIsProcessing(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setErrorMessage(resp?.error?.description || "Payment failed. Please try again.");
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Checkout error:", err);
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <ProContext.Provider
      value={{
        isPro,
        isProLoading,
        openUpgradeModal,
        closeUpgradeModal,
        requirePro,
      }}
    >
      {children}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={closeUpgradeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-[32px] p-7 sm:p-9 shadow-2xl overflow-hidden"
            >
              {/* Subtle top ambient highlight */}
              <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-44 rounded-full bg-amber-500/10 blur-3xl" />

              {!isProcessing && !paymentSuccess && (
                <button
                  onClick={closeUpgradeModal}
                  aria-label="Close upgrade modal"
                  className="absolute top-6 right-6 w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              {paymentSuccess ? (
                <div className="py-10 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Welcome to Jamphy Pro!</h3>
                  <p className="text-sm text-zinc-400">
                    Your payment is verified. All Pro features are now unlocked.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-bold uppercase tracking-wider mb-3">
                      <span>Jamphy Pro Pass</span>
                      <span className="text-amber-500/60">•</span>
                      <span>One-Time Payment</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                      {featureLabel
                        ? `Unlock ${featureLabel}`
                        : "Unlock Everything in Jamphy"}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1.5">
                      Pay once and get lifetime access to every pro preparation tool. No subscriptions.
                    </p>
                  </div>

                  {/* Price Card */}
                  <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800 p-4 mb-6 flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                        Lifetime Access
                      </div>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-3xl font-black text-white">₹499</span>
                        <span className="text-xs text-zinc-400 font-medium">one-time</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                        Instant Unlock
                      </span>
                      <div className="text-[11px] text-zinc-500 mt-1">UPI, Cards & Netbanking</div>
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3 mb-7">
                    {PRO_FEATURES.map((feat) => (
                      <div key={feat.title} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0 text-white">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white leading-snug">
                            {feat.title}
                          </div>
                          <div className="text-xs text-zinc-400 leading-relaxed">
                            {feat.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {errorMessage && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full py-4 rounded-2xl bg-white text-black font-bold text-base hover:bg-zinc-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        <span>Opening Razorpay...</span>
                      </>
                    ) : status !== "authenticated" ? (
                      <span>Sign in with Google to Upgrade</span>
                    ) : (
                      <span>Pay ₹499 & Unlock Pro</span>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-zinc-500 mt-3">
                    Secured by Razorpay • Instant activation on your account
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProContext.Provider>
  );
}

export function usePro() {
  return useContext(ProContext);
}

