"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/ConfirmModal";

export default function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: "space_dashboard" },
    { name: "Profil & Visi Misi", href: "/admin/profil", icon: "account_balance" },
    { name: "Beranda Utama", href: "/admin/beranda", icon: "home" },
    { name: "Organisasi", href: "/admin/organisasi", icon: "account_tree" },
    { name: "Direktori", href: "/admin/direktori", icon: "groups" },
    { name: "Galeri", href: "/admin/galeri", icon: "gallery_thumbnail" },
    { name: "Absensi", href: "/admin/absensi", icon: "face" },
    { name: "Kontak & FAQ", href: "/admin/kontak", icon: "contact_support" },
  ];

  return (
    <ToastProvider>
      <ConfirmProvider>
        <div className="min-h-screen bg-blue-50/50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-blue-100 flex-col h-screen sticky top-0 hidden lg:flex shadow-sm z-20">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-blue-50">
          <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
          <div className="flex flex-col">
            <span className="font-extrabold text-blue-950 leading-tight uppercase tracking-wide">Portal</span>
            <span className="text-[10px] uppercase font-bold text-blue-500 tracking-widest">Admin SMAN 1</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest pl-2 mb-4 mt-2">Menu Utama</div>
          {menuItems.map((item) => {
            // Check exact match for dashboard, startswith for subpages to keep active state
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? "bg-blue-700 text-white shadow-md shadow-blue-700/20" 
                    : "text-blue-800 hover:bg-blue-50"
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'text-white' : 'text-blue-500'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-50">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all">
            <span className="material-symbols-outlined">logout</span>
            Keluar
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 lg:hidden flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-blue-50">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
            <span className="font-extrabold text-blue-950">Portal Admin</span>
          </div>
          <button onClick={() => setIsMobileOpen(false)} className="text-blue-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? "bg-blue-700 text-white shadow-md shadow-blue-700/20" 
                    : "text-blue-800 hover:bg-blue-50"
                }`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'text-white' : 'text-blue-500'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-blue-50">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-all">
            <span className="material-symbols-outlined">logout</span>
            Keluar Sesi
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="h-16 bg-white border-b border-blue-100 flex items-center px-4 lg:hidden sticky top-0 z-30 shadow-sm justify-between">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileOpen(true)} className="text-blue-800 p-1 hover:bg-blue-50 rounded-lg">
                <span className="material-symbols-outlined">menu</span>
             </button>
             <span className="font-extrabold text-blue-950 uppercase tracking-widest text-sm">Dashboard</span>
          </div>
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
        </header>
        
        {/* Page Content */}
        <main className="p-4 md:p-8 flex-1 overflow-y-auto">
          {children}
          </main>
        </div>
      </div>
      </ConfirmProvider>
    </ToastProvider>
  );
}
