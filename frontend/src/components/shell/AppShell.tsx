"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { APP_NAVIGATION } from "@/lib/navigation";
import { useFinSyncSession } from "@/components/session/FinSyncSessionProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearSession } = useFinSyncSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const resetSession = () => {
    clearSession();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <aside aria-hidden={!sidebarOpen} className={`fixed inset-y-0 left-0 z-30 w-64 overflow-hidden border-r border-black bg-white transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "pointer-events-none -translate-x-full"}`}>
        <div className="flex h-16 w-64 items-center justify-between border-b border-black/10 px-5">
          <Link href="/dashboard" className="text-2xl font-black tracking-[-0.05em]">ledgr</Link>
          <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Hide sidebar" className="rounded-lg p-2 hover:bg-black hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="w-64 space-y-1 p-4">
          {APP_NAVIGATION.map(([label, href, Icon]) => (
            <Link key={href} href={href} onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${pathname === href || pathname.startsWith(`${href}/`) ? "bg-black text-white" : "text-black hover:bg-black hover:text-white"}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className={`transition-[padding] duration-300 ${sidebarOpen ? "lg:pl-64" : "pl-0"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black bg-white px-4 sm:px-7">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen((open) => !open)} aria-label={sidebarOpen ? "Hide sidebar" : "Open sidebar"} aria-expanded={sidebarOpen} className="rounded-lg border border-black/10 bg-white p-2 hover:bg-black hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            {!sidebarOpen && <Link href="/dashboard" className="text-xl font-black tracking-[-0.05em]">ledgr</Link>}
          </div>
          <button type="button" onClick={resetSession} className="secondary-button !px-3 !py-2">Reset Session</button>
        </header>
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-7 pb-24 sm:px-7">{children}</main>
      </div>

      {sidebarOpen && <button type="button" aria-label="Close sidebar overlay" onClick={() => setSidebarOpen(false)} className="sidebar-backdrop fixed inset-0 z-20 bg-black lg:hidden" />}
    </div>
  );
}
