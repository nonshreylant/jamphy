"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import { useTransitionContext } from "@/components/TransitionProvider";

export default function ContactPage() {
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
          <h1 className="text-4xl md:text-5xl font-black mb-4">Contact Us</h1>
          <p className="text-xl text-zinc-400">We’re here to help you succeed on your journey to mastering physics.</p>
        </div>

        <div className="space-y-12">
          <section>
            <p className="text-zinc-300 text-lg leading-relaxed mb-6">
              Whether you have a question about a specific problem, need technical assistance, or want to share feedback on how we can improve the platform, we’d love to hear from you.
            </p>
          </section>

          <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Get in Touch</h2>
            <p className="text-zinc-300 text-lg mb-4">
              Please feel free to reach out to us at our support email:
            </p>
            <a href="mailto:contact@jamphy.com" className="text-xl font-bold text-white hover:text-cyan-400 transition">
              contact@jamphy.com
            </a>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Response Time</h2>
            <p className="text-zinc-300 text-lg leading-relaxed">
              Our support team is dedicated to providing you with timely assistance. You can expect a response from us within 24-48 hours.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
