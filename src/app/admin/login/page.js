"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTransitionContext } from "../../../components/TransitionProvider";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { navigateWithTransition } = useTransitionContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        window.location.href = "/admin";
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex items-center justify-center p-4 font-sans relative">
      <div className="absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-50" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bgpicdarker.png')" }} />
      <div className="w-full max-w-md p-8 bg-black/40 border border-white/5 backdrop-blur-xl">
        <div className="flex justify-center mb-6">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateWithTransition("/");
            }}
          >
            <Image
              src="/jamphy2sized.png"
              alt="Jamphy Logo"
              width={180}
              height={49}
              className="rounded-2xl object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
        <h1 className="text-2xl font-light tracking-widest uppercase mb-2 text-center">Admin Login</h1>
        <p className="text-zinc-500 text-xs font-light text-center mb-8">AUTHENTICATE TO ACCESS DASHBOARD</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-light tracking-widest uppercase text-zinc-500 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-800 px-4 py-2 text-white outline-none focus:border-white transition-colors font-light"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-light tracking-widest uppercase text-zinc-500 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-800 px-4 py-2 text-white outline-none focus:border-white transition-colors font-light"
              required
            />
          </div>
          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-sm font-light tracking-widest uppercase text-zinc-300 hover:text-white transition border-b border-transparent hover:border-white pb-1 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-zinc-500 hover:text-white transition text-sm">
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
