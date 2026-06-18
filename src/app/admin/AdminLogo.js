"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransitionContext } from "../../components/TransitionProvider";

export default function AdminLogo() {
  const { navigateWithTransition } = useTransitionContext();
  
  return (
    <Link
      href="/"
      onClick={(e) => {
        e.preventDefault();
        navigateWithTransition("/");
      }}
    >
      <Image
        src="/logo.png"
        alt="Jamphy Admin Logo"
        width={148}
        height={40}
        className="rounded-xl object-contain hover:opacity-80 transition-opacity"
        priority
      />
    </Link>
  );
}
