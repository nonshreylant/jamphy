"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import InlineLofiPlayer from "@/components/InlineLofiPlayer";

import { useTransitionContext } from "@/components/TransitionProvider";

export default function PrivacyPage() {
  const { data: session } = useSession();
  const { navigateWithTransition } = useTransitionContext();

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between">
          <Link 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateWithTransition("/");
            }}
            className="shrink-0"
          >
            <Image src="/jamphy2sized.png" alt="Logo" width={148} height={40} className="h-auto w-32 object-contain shrink-0" priority />
          </Link>
          <InlineLofiPlayer />
            <UserMenu session={session} />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Privacy Policy</h1>
          <p className="text-xl text-zinc-400">Last Updated: 18 June 2026</p>
        </div>

        <div className="space-y-10 text-zinc-300 text-lg leading-relaxed">
          <p>
            Welcome to <strong className="text-white">jamphy</strong>. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how jamphy collects, uses, stores, and safeguards information when you access or use our website, educational resources, and related services.
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. About jamphy</h2>
            <p>
              jamphy is an educational platform designed to help students prepare for the IIT JAM Physics examination through practice questions, study resources, performance tracking, and other learning tools.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. Information We Collect</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3 text-zinc-100">Information You Provide</h3>
            <p className="mb-4">We may collect information that you voluntarily provide, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Name</li>
              <li>Email address</li>
              <li>Account credentials</li>
              <li>Feedback and support requests</li>
              <li>Information submitted through forms or contact pages</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3 text-zinc-100">Information Collected Automatically</h3>
            <p className="mb-4">When you use jamphy, certain information may be collected automatically, including:</p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Pages visited</li>
              <li>Time spent on the platform</li>
              <li>Date and time of access</li>
              <li>Referring website information</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3 text-zinc-100">Learning and Performance Data</h3>
            <p className="mb-4">To improve your learning experience, jamphy may collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Questions attempted</li>
              <li>Answers submitted</li>
              <li>Test scores and performance metrics</li>
              <li>Progress and completion status</li>
              <li>Study preferences and activity history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. How We Use Your Information</h2>
            <p className="mb-4">We use collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the platform</li>
              <li>Personalize your learning experience</li>
              <li>Track academic progress and performance</li>
              <li>Improve educational content and features</li>
              <li>Respond to inquiries and support requests</li>
              <li>Analyze platform usage and trends</li>
              <li>Detect and prevent misuse, fraud, or security threats</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Cookies and Similar Technologies</h2>
            <p className="mb-4">jamphy may use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Keep users signed in</li>
              <li>Remember preferences and settings</li>
              <li>Improve website performance</li>
              <li>Understand how users interact with the platform</li>
            </ul>
            <p>You may disable cookies through your browser settings, though certain features may not function properly.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Sharing of Information</h2>
            <p className="mb-4">jamphy does not sell, rent, or trade personal information to third parties.</p>
            <p className="mb-4">Information may be shared only:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With service providers who help operate the platform</li>
              <li>When required by law or legal process</li>
              <li>To protect the rights, safety, and security of jamphy and its users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">6. Data Security</h2>
            <p className="mb-4">
              We implement reasonable technical and organizational measures to protect user information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p>
              However, no online service can guarantee complete security, and users acknowledge that they use the platform at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">7. Data Retention</h2>
            <p className="mb-4">We retain personal information only for as long as necessary to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide our services</li>
              <li>Maintain user accounts</li>
              <li>Track learning progress</li>
              <li>Meet legal and regulatory requirements</li>
            </ul>
            <p>Information that is no longer required may be deleted or anonymized.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">8. Children's Privacy</h2>
            <p>
              jamphy is intended primarily for students and learners. We do not knowingly collect personal information in violation of applicable laws regarding minors. Parents or guardians who believe that a child has provided personal information without appropriate consent may contact us for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">9. Third-Party Links</h2>
            <p>
              The platform may contain links to third-party websites, educational resources, or services. jamphy is not responsible for the privacy practices or content of those external websites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">10. Your Rights</h2>
            <p className="mb-4">Depending on your location and applicable laws, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent where applicable</li>
              <li>Request a copy of your stored data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">11. Changes to This Privacy Policy</h2>
            <p>
              jamphy may update this Privacy Policy from time to time. Any changes will be posted on this page along with the updated revision date. Continued use of the platform after such changes constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">12. Contact Us</h2>
            <p className="mb-4">
              If you have questions regarding this Privacy Policy or your personal information, please contact:
            </p>
            <div className="mb-4">
              <p><strong className="text-white">jamphy</strong></p>
              <p>Email: <a href="mailto:jamphy.admin@gmail.com" className="text-zinc-300 underline underline-offset-4 hover:text-white transition">jamphy.admin@gmail.com</a></p>
            </div>
            <p className="italic text-sm text-zinc-500 mt-8">
              By using jamphy, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
