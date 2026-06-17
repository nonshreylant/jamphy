"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import { useTransitionContext } from "@/components/TransitionProvider";

export default function PrivacyPage() {
  const { data: session } = useSession();
  const { navigateWithTransition } = useTransitionContext();

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateWithTransition("/");
            }}
            className="shrink-0"
          >
            <Image src="/logo.png" alt="Logo" width={148} height={40} className="rounded-xl object-contain shrink-0" priority />
          </Link>
          <UserMenu session={session} />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
          <p className="text-xl text-zinc-400">Effective Date: June 2026</p>
        </div>

        <div className="space-y-10 text-zinc-300 text-lg leading-relaxed">
          <p>
            Welcome to <strong className="text-white">jamphy</strong>. We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you use our educational quiz and prep platform.
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">1. Information We Collect</h2>
            <p className="mb-4">When you interact with our platform, we may collect the following types of information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Account Data:</strong> Information you provide when registering, such as your name, email address, and profile details.</li>
              <li><strong className="text-white">Usage Data:</strong> Details about your interactions with our platform, including quiz scores, study progress, and the pages you visit.</li>
              <li><strong className="text-white">Log Data:</strong> Information automatically collected by our servers, such as your IP address, browser type, operating system, and timestamp of your visit.</li>
              <li><strong className="text-white">Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to track activity on our platform and hold certain information to enhance your user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">2. How We Use Your Information</h2>
            <p className="mb-4">We use the collected data for various purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, and maintain our service.</li>
              <li>To personalize your learning experience and track your progress.</li>
              <li>To analyze usage trends and improve platform performance.</li>
              <li>To communicate with you regarding updates, support, and administrative messages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">3. Third-Party Privacy & Cookies</h2>
            <p className="mb-4">To help keep jamphy free and accessible, we use third-party advertising companies, such as Google, to serve ads when you visit our website.</p>
            <ul className="list-disc pl-6 space-y-4">
              <li>These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</li>
              <li><strong className="text-white">Google AdSense:</strong> As a third-party vendor, Google uses cookies (such as the DoubleClick cookie) to serve ads on our site. Google's use of advertising cookies enables it and its partners to serve ads to our users based on their prior visits to our site and/or other sites on the Internet.</li>
              <li><strong className="text-white">Opting Out:</strong> Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">Google Ads Settings</a>. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">www.aboutads.info</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures designed to protect your personal data against accidental or unlawful destruction, loss, alteration, and unauthorized disclosure or access. However, please remember that no method of transmission over the internet or method of electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">5. Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including the right to access, update, or request deletion of your data. If you wish to exercise any of these rights, please contact us using the information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">6. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">7. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please contact us at: <a href="mailto:contact@jamphy.com" className="text-cyan-400 font-bold hover:underline">contact@jamphy.com</a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
