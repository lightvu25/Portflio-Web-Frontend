"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAdmin } from "@/lib/auth/useAdmin";

const navItems = [
  { label: "Tổng quan", href: "/admin", icon: "◉" },
  { label: "Hình ảnh", href: "/admin/photos", icon: "▤" },
  { label: "Danh mục", href: "/admin/categories", icon: "❏" },
  { label: "Lịch đặt", href: "/admin/bookings", icon: "◷" },
  { label: "Thanh toán", href: "/admin/payments", icon: "₫" },
  { label: "Cảm nhận", href: "/admin/feedback", icon: "✎" },
  { label: "Bảng giá", href: "/admin/pricing", icon: "≡" },
  { label: "Cài đặt", href: "/admin/settings", icon: "⚙" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Admin">
      {navItems.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
              active ? "bg-green-600 text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span aria-hidden="true" className="w-5 text-center text-base">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarInner({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 py-7">
        <p className="text-xl font-bold tracking-wide text-gray-900">
          BẤU CHỤP CHOÉT <span className="font-light text-gray-400">ADMIN</span>
        </p>
      </div>
      <div className="mx-5 border-t border-gray-100" />
      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="p-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

/**
 * Admin shell — Horizon-style: light content bg, white sidebar with green
 * active pill, top navbar with page title + logout. Self-guards: without a
 * token it redirects to /admin/login. The login page itself renders bare.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { token, ready, logout } = useAdmin();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Login page renders without the admin chrome.
  if (pathname === "/admin/login") return <>{children}</>;

  if (!ready || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fe] text-sm text-gray-500">
        Đang kiểm tra đăng nhập…
      </div>
    );
  }

  const current = navItems.find((i) => (i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href)));

  return (
    <div className="min-h-screen bg-[#f4f7fe] text-gray-900 [font-family:ui-sans-serif,system-ui,Arial,sans-serif]">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-100 bg-white lg:block">
        <SidebarInner onLogout={logout} />
      </aside>

      {/* Sidebar — mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl">
            <SidebarInner onNavigate={() => setMobileOpen(false)} onLogout={logout} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur md:px-8">
          <button
            type="button"
            aria-label="Mở menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
          <div className="min-w-0">
            <p className="text-xs text-gray-400">Trang / Quản trị</p>
            <h1 className="truncate text-lg font-bold text-gray-900">{current?.label ?? "Tổng quan"}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 sm:inline">
              Quản trị viên
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
