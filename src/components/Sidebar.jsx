"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ open = false, onClose }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: "/icons/gauge.svg" },
    { href: "/c-sink-network", label: "C-Sink Network", icon: "/globe.svg" },
    { href: "/biochar", label: "Biochar", icon: "/icons/leaf.svg" },
    { href: "/reports", label: "Reports", icon: "/file.svg" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed h-screen inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-gray-200 shadow-md transition-transform duration-300 ease-in-out md:static md:z-auto md:shadow-none ${
          open ? "translate-x-0 md:translate-x-0 md:block" : "-translate-x-full md:hidden"
        }`}
      >
        <div className="flex h-screen flex-col bg-white">
          {/* Sidebar Header with logo + name and mobile close */}
          <div className="flex items-center justify-between h-20 border-b border-gray-200 px-3">
            <div className="flex items-center gap-2">
              <img src="/icons/logo.png" alt="Logo" className="h-16 w18 object-contain" />
              <span className="text-lg font-semibold tracking-wide text-black">
                kriSHE
              </span>
            </div>
            {/* Sidebar toggle (hamburger) */}
            <button
              aria-label={open ? "Close Sidebar" : "Open Sidebar"}
              onClick={onClose}
              className="p-2 rounded-md border border-gray-200 bg-white shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="7" x2="21" y2="7"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="17" x2="21" y2="17"></line>
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col p-3 gap-1 mt-2 text-gray-900">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gray-200 text-black"
                      : "text-gray-800 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-md`}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      className={`h-6 w-6 ${isActive ? "opacity-100" : "opacity-70"}`}
                    />
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profile at bottom */}
          <div className="mt-auto p-3 border-t border-gray-200">
            <button className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="flex items-center gap-3">
                <img src="/icons/profile.svg" alt="User" className="h-7 w-7 rounded-full" />
                <span className="text-sm font-medium text-gray-900">Admin</span>
              </span>
              <img src="/icons/chevron-down.svg" alt="" className="h-4 w-4 opacity-70" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
