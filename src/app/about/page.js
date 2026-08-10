"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import InlineLofiPlayer from "@/components/InlineLofiPlayer";

import { useTransitionContext } from "@/components/TransitionProvider";

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-black mb-4">About Us</h1>
          <p className="text-xl text-zinc-400">Welcome to jamphy, your dedicated partner in mastering physics and acing your entrance exams.</p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">Our Mission</h2>
            <p className="text-zinc-300 text-lg leading-relaxed">
              At jamphy, our mission is to make high-level physics accessible, understandable, and conquerable. We provide university students with a rigorous, math-ready platform specifically designed for IIT JAM Physics preparation. We believe that with the right tools, clear explanations, and targeted practice, every student can achieve their academic goals.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">What We Do</h2>
            <p className="text-zinc-300 text-lg leading-relaxed">
              We offer a comprehensive educational quiz and preparation platform tailored to the nuances of the IIT JAM Physics syllabus. Beyond just providing questions, we focus on delivering deep, math-ready explanations that bridge the gap between abstract concepts and practical problem-solving. Whether you are reviewing core mechanics or diving into quantum theory, jamphy is built to test your knowledge and strengthen your foundation.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-cyan-400">Who It's For</h2>
            <p className="text-zinc-300 text-lg leading-relaxed">
              Our platform is built exclusively for university students and aspirants preparing for the IIT JAM Physics entrance exam. If you are driven, curious, and determined to secure your spot in a premier postgraduate program, jamphy is designed for you.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
