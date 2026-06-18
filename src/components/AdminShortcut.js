"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminShortcut() {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed bottom-4 right-4 flex items-center z-50">
        {pathname !== "/admin" && (
          <Link
            href="/admin"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-all"
          >
            Admin
          </Link>
        )}
      </div>

      {pathname === "/" && (
        <div className="fixed bottom-4 left-4 flex items-center gap-4 z-50">
          <Link
            href="/privacy"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-all"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-all"
          >
            Terms of Service
          </Link>
        </div>
      )}
    </>
  );
}
