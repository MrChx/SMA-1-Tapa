"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type NavLink = { name: string; href: string; children?: { name: string; href: string }[] };

export default function Navbar() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navLinks: NavLink[] = [
    { name: "Beranda", href: "/" },
    { name: "Profil & Visi Misi", href: "/profil" },
    {
      name: "Organisasi", href: "/organisasi",
      children: [
        { name: "OSIS", href: "/organisasi/osis" },
        { name: "Rohis", href: "/organisasi/rohis" },
        { name: "Pramuka", href: "/organisasi/pramuka" },
        { name: "PMR", href: "/organisasi/pmr" },
        { name: "PIK-R", href: "/organisasi/pikr" },
      ],
    },
    {
      name: "Direktori", href: "/direktori",
      children: [
        { name: "Guru & Staf", href: "/direktori/guru" },
        { name: "Siswa", href: "/direktori/siswa" },
      ],
    },
    { name: "Galeri", href: "/galeri" },
    { name: "Absensi", href: "/absensi" },
    { name: "Kontak Kami", href: "/kontak" },
  ];

  const handleDropdownEnter = (name: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(name);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  return (
    <>
      <nav className="sticky top-0 w-full z-[100] bg-gradient-to-r from-[#175bb8] to-[#4c99eb] shadow-md">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8 h-20">
          {/* Mobile Menu Icon & Brand Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              className="lg:hidden p-1 text-white hover:bg-white/20 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
            </button>
            <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Logo SMA Negeri 1 Tapa" width={48} height={48} className="h-12 w-12 object-contain drop-shadow-md" />
              <div className="hidden sm:block leading-tight">
                <div className="text-white font-extrabold text-lg tracking-tight">SMA N 1 Tapa</div>
                <div className="text-blue-100 text-[10px] font-semibold tracking-widest uppercase">Bone Bolango</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 text-sm font-semibold">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.children && link.children.some(c => pathname === c.href));

              if (link.children) {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter(link.name)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <Link
                      href={link.href}
                      className={`px-3 py-2 rounded-lg flex items-center gap-1 transition-all ${isActive ? "text-white font-bold" : "text-blue-100 hover:text-white"}`}
                    >
                      {link.name}
                      <span className={`material-symbols-outlined text-sm transition-transform ${openDropdown === link.name ? "rotate-180" : ""}`}>expand_more</span>
                    </Link>
                    {openDropdown === link.name && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-blue-100 py-2 min-w-[180px] animate-[fadeIn_0.15s_ease-out]">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-5 py-2.5 text-sm font-medium transition-colors ${pathname === child.href ? "text-blue-700 bg-blue-50 font-bold" : "text-blue-900 hover:bg-blue-50 hover:text-blue-700"}`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg transition-all ${isActive ? "text-white font-bold border-b-2 border-white" : "text-blue-100 hover:text-white hover:scale-105"}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Search */}
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
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[150] transition-opacity lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 left-0 w-3/4 max-w-xs h-full bg-white z-[200] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-blue-100">
             <div className="flex items-center gap-3">
               <Image src="/logo.png" alt="SMA 1 Tapa Logo" width={40} height={40} className="object-contain" />
               <span className="font-bold text-blue-950 leading-tight">SMA N 1 Tapa</span>
             </div>
             <button onClick={() => setIsMobileMenuOpen(false)} className="text-blue-900 hover:bg-blue-50 p-1 rounded-md transition-colors">
                <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.children && link.children.some(c => pathname === c.href));

              if (link.children) {
                return (
                  <div key={link.name}>
                    <button
                      onClick={() => setOpenMobileDropdown(openMobileDropdown === link.name ? null : link.name)}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between ${
                        isActive ? "bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-700 shadow-sm" : "text-blue-900 hover:bg-blue-50 border-l-4 border-transparent"
                      }`}
                    >
                      {link.name}
                      <span className={`material-symbols-outlined text-sm transition-transform ${openMobileDropdown === link.name ? "rotate-180" : ""}`}>expand_more</span>
                    </button>
                    {openMobileDropdown === link.name && (
                      <div className="ml-6 mt-1 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              pathname === child.href ? "bg-blue-100 text-blue-700 font-bold" : "text-blue-800 hover:bg-blue-50"
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between ${
                    isActive ? "bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-700 shadow-sm" : "text-blue-900 hover:bg-blue-50 border-l-4 border-transparent"
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
