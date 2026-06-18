"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import { useTransitionContext } from "@/components/TransitionProvider";

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl md:text-5xl font-black mb-4">Terms of Service</h1>
          <p className="text-xl text-zinc-400">Last Updated: 18 June 2026</p>
        </div>

        <div className="space-y-10 text-zinc-300 text-lg leading-relaxed">
          <p>
            Welcome to <strong className="text-white">jamphy</strong>. These Terms of Service ("Terms") govern your access to and use of the jamphy website, educational content, practice questions, mock tests, and related services (collectively, the "Services").
          </p>
          <p>
            By accessing or using jamphy, you agree to be bound by these Terms. If you do not agree with these Terms, please do not use the Services.
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">1. About jamphy</h2>
            <p className="mb-4">
              jamphy is an educational platform that provides resources for IIT JAM Physics preparation, including practice questions, study materials, mock tests, performance analytics, and related educational tools.
            </p>
            <p>The Services are provided for educational and informational purposes only.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">2. Eligibility</h2>
            <p className="mb-4">You may use jamphy if you:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Are legally capable of entering into a binding agreement; or</li>
              <li>Have permission from a parent or legal guardian if required under applicable laws.</li>
            </ul>
            <p>By using the Services, you represent that you meet these requirements.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">3. User Accounts</h2>
            <p className="mb-4">Certain features may require you to create an account.</p>
            <p className="mb-4">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Provide accurate and complete information.</li>
              <li>Maintain the security of your account credentials.</li>
              <li>Notify us promptly of any unauthorized use of your account.</li>
              <li>Accept responsibility for activities occurring under your account.</li>
            </ul>
            <p>jamphy is not responsible for losses resulting from unauthorized access caused by your failure to safeguard account credentials.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">4. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Violate any applicable laws or regulations.</li>
              <li>Attempt to gain unauthorized access to the platform or its systems.</li>
              <li>Interfere with the operation, security, or functionality of the Services.</li>
              <li>Use automated tools to scrape, harvest, copy, or extract content without permission.</li>
              <li>Upload malicious software, viruses, or harmful code.</li>
              <li>Impersonate another person or entity.</li>
              <li>Engage in activities that disrupt other users' access to the Services.</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">5. Educational Content</h2>
            <p className="mb-4">The educational materials provided on jamphy are intended to assist learning and examination preparation.</p>
            <p className="mb-4">While we strive for accuracy, we do not guarantee that:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>All content is error-free.</li>
              <li>Questions or solutions are complete or accurate.</li>
              <li>Performance on jamphy will directly translate to examination results.</li>
            </ul>
            <p>Users should independently verify important academic information where necessary.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">6. Intellectual Property</h2>
            <p className="mb-4">Unless otherwise stated, all content available on jamphy, including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Questions</li>
              <li>Solutions</li>
              <li>Notes</li>
              <li>Text</li>
              <li>Graphics</li>
              <li>Logos</li>
              <li>Website design</li>
              <li>Software and code</li>
            </ul>
            <p className="mb-4">is owned by or licensed to jamphy and is protected by applicable intellectual property laws.</p>
            <p className="mb-4">You may access and use content solely for personal, non-commercial educational purposes.</p>
            <p className="mb-4">You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reproduce, distribute, sell, sublicense, or commercially exploit content without prior written permission.</li>
              <li>Remove copyright or ownership notices.</li>
              <li>Create derivative works based on proprietary content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">7. User-Generated Content</h2>
            <p className="mb-4">
              If you submit feedback, comments, suggestions, or other content to jamphy, you grant jamphy a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content for the purpose of operating and improving the Services.
            </p>
            <p>You remain responsible for the content you submit.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">8. Service Availability</h2>
            <p className="mb-4">We strive to maintain uninterrupted access to the Services but do not guarantee continuous availability.</p>
            <p className="mb-4">jamphy may:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Modify features or content.</li>
              <li>Perform maintenance.</li>
              <li>Suspend or discontinue portions of the Services.</li>
              <li>Restrict access when necessary for security or operational reasons.</li>
            </ul>
            <p>We shall not be liable for temporary interruptions or service outages.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">9. Third-Party Services and Links</h2>
            <p className="mb-4">The Services may contain links to third-party websites, tools, or resources.</p>
            <p className="mb-4">jamphy does not control and is not responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Third-party content</li>
              <li>Policies</li>
              <li>Products</li>
              <li>Services</li>
            </ul>
            <p>Your interactions with third parties are governed by their respective terms and policies.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">10. Disclaimer of Warranties</h2>
            <p className="mb-4">The Services are provided on an "as is" and "as available" basis.</p>
            <p className="mb-4">To the maximum extent permitted by law, jamphy disclaims all warranties, whether express or implied, including warranties of:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Accuracy</li>
              <li>Reliability</li>
              <li>Availability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement</li>
            </ul>
            <p>We do not guarantee that the Services will be error-free, secure, or uninterrupted.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">11. Limitation of Liability</h2>
            <p className="mb-4">
              To the fullest extent permitted by law, jamphy and its owners, administrators, contributors, and affiliates shall not be liable for any indirect, incidental, consequential, special, or punitive damages arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Use or inability to use the Services</li>
              <li>Reliance on educational content</li>
              <li>Loss of data</li>
              <li>Service interruptions</li>
              <li>Unauthorized access to user information</li>
            </ul>
            <p>Your use of the Services is at your own risk.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">12. Termination</h2>
            <p className="mb-4">We reserve the right to suspend or terminate access to the Services at any time, with or without notice, if:</p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>You violate these Terms.</li>
              <li>Your use poses a security risk.</li>
              <li>We are required to do so by law.</li>
              <li>Continued access is deemed harmful to the platform or its users.</li>
            </ul>
            <p>Upon termination, provisions relating to intellectual property, disclaimers, and limitations of liability shall remain in effect.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">13. Changes to These Terms</h2>
            <p className="mb-4">jamphy may update these Terms from time to time.</p>
            <p>
              Updated versions will be posted on this page with a revised "Last Updated" date. Continued use of the Services after changes become effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">14. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
            </p>
            <p>
              Any disputes arising from these Terms or the use of the Services shall be subject to the jurisdiction of the courts located in Delhi, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-white">15. Contact</h2>
            <p className="mb-4">
              For questions regarding these Terms, please contact:
            </p>
            <div className="mb-4">
              <p><strong className="text-white">jamphy</strong></p>
              <p>Email: <a href="mailto:jamphy.admin@gmail.com" className="text-zinc-300 underline underline-offset-4 hover:text-white transition">jamphy.admin@gmail.com</a></p>
            </div>
            <p className="italic text-sm text-zinc-500 mt-8">
              By accessing or using jamphy, you acknowledge that you have read, understood, and agreed to these Terms of Service.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
