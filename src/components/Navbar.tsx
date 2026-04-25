"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (pathname.startsWith('/login') || pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: "Beranda", href: "/" },
    { name: "Profil & Visi Misi", href: "/profil" },
    { name: "Organisasi", href: "/organisasi" },
    { name: "Direktori", href: "/direktori" },
    { name: "Galeri", href: "/galeri" },
    { name: "Absensi", href: "/absensi" },
    { name: "Kontak Kami", href: "/kontak" },
  ];

  return (
    <>
      <nav className="sticky top-0 w-full z-[100] bg-gradient-to-r from-[#175bb8] to-[#4c99eb] shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8 h-20">
          {/* Mobile Menu Icon & Brand Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              className="lg:hidden p-1 text-white hover:bg-white/20 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="material-symbols-outlined text-[28px]">more_vert</span>
            </button>
            <Link href="/" className="flex items-center gap-2 md:gap-4">
              <Image src="/logo.png" alt="SMA 1 Tapa Logo" width={56} height={56} className="w-10 h-10 md:w-14 md:h-14 object-contain" />
              <div className="flex flex-col">
                <span className="text-base md:text-xl font-bold text-white tracking-wide uppercase leading-tight">
                  SMA Negeri 1 Tapa
                </span>
                <span className="hidden md:inline text-[10px] md:text-sm text-blue-50 font-medium leading-tight mt-0.5">
                  SMA Hebat - Maju Semua
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 font-medium text-sm tracking-tight">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  className={isActive 
                    ? "text-white font-bold border-b-2 border-white pb-1 transition-all" 
                    : "text-blue-100 hover:text-white hover:scale-105 transition-all"}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Trailing Actions: Search */}
          <div className="flex items-center">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                  setIsSearchOpen(false);
                }
              }}
              className={`relative flex items-center transition-all duration-500 ease-in-out ${isSearchOpen ? 'w-[160px] md:w-[240px]' : 'w-10'}`}
            >
              <input
                type="text"
                placeholder="Cari berita, guru, atau faq..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full overflow-hidden h-10 bg-white/20 backdrop-blur-md rounded-full pl-10 pr-4 text-white text-sm placeholder:text-blue-100 outline-none border border-white/30 focus:border-white transition-all duration-500 ${isSearchOpen ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}
              />
              <button 
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="absolute left-0 w-10 h-10 flex items-center justify-center text-white hover:text-blue-200 transition-colors z-10"
                title="Cari"
              >
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">{isSearchOpen ? 'close' : 'search'}</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Drawer */}
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[150] transition-opacity lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 w-3/4 max-w-xs h-full bg-white z-[200] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-blue-100">
             <div className="flex items-center gap-3">
               <Image src="/logo.png" alt="SMA 1 Tapa Logo" width={40} height={40} className="object-contain" />
               <span className="font-bold text-blue-950 leading-tight">SMA N 1 Tapa</span>
             </div>
             <button onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 hover:bg-blue-50 p-1 rounded-md transition-colors">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between ${
                    isActive 
                      ? "bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-700 shadow-sm" 
                      : "text-blue-900 hover:bg-blue-50 border-l-4 border-transparent"
                  }`}
                >
                  {link.name}
                  {isActive && <span className="material-symbols-outlined text-sm">chevron_right</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
