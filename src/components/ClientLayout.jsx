"use client";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function ClientLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hamburger (show only when sidebar is closed) */}
      {!sidebarOpen && (
        <button
          aria-label="Open Sidebar"
          onClick={() => setSidebarOpen(true)}
          className="fixed left-4 top-4 z-[60] p-2 rounded-md border border-gray-200 bg-white shadow-sm active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="7" x2="21" y2="7"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="17" x2="21" y2="17"></line>
          </svg>
        </button>
      )}

      <div className={`grid grid-cols-1 ${sidebarOpen ? "md:grid-cols-[240px_1fr]" : "md:grid-cols-1"}`}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen((v) => !v)} />
        <main className={`min-h-screen p-4 sm:p-6 lg:p-8 ${!sidebarOpen ? "pt-14" : ""}`}>{children}</main>
      </div>
    </div>
  );
}


