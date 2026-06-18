"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminShortcut() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50">
      {pathname !== "/admin" && (
        <Link
          href="/admin"
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-950/30 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/80 backdrop-blur transition-all border border-transparent hover:border-zinc-700"
        >
          Admin
        </Link>
      )}
      {pathname === "/" && (
        <Link
          href="/privacy"
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-950/30 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/80 backdrop-blur transition-all border border-transparent hover:border-zinc-700"
        >
          Privacy Policy
        </Link>
      )}
    </div>
  );
}
