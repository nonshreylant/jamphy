import { prisma } from "@/lib/prisma";
import InlineLofiPlayer from "@/components/InlineLofiPlayer";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminLogout, updateReportStatus } from "./actions";
import AdminTabs from "./AdminTabs";
import AdminLogo from "./AdminLogo";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // We already have middleware, but we can do an extra check here if we want

  // Fetch users
  const users = await prisma.user.findMany({
    orderBy: {
      id: 'desc'
    },
    include: {
      accounts: true,
    }
  });

  // Fetch reports
  const reports = await prisma.report.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      user: true,
    }
  });

  return (
    <div className="min-h-screen bg-transparent text-white font-sans pb-24">
      <div className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/bgpicdarker.png')" }} />
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AdminLogo />
            <span className="font-light text-sm tracking-widest uppercase text-zinc-500 hidden sm:block">Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm font-light tracking-widest uppercase text-zinc-400 hover:text-white transition border-b border-transparent hover:border-white pb-1">
              Back to App
            </Link>
            <form action={adminLogout}>
              <button type="submit" className="text-sm font-light tracking-widest uppercase text-red-400 hover:text-red-300 transition border-b border-transparent hover:border-red-300 pb-1">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AdminTabs reports={reports} users={users} />
      </main>
    </div>
  );
}
