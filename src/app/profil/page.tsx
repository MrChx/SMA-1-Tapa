import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Profil() {
  const rows = await prisma.siteConfig.findMany();
  const cfg: Record<string, string> = {};
  for (const r of rows) cfg[r.key] = r.value;

  const pilarList = (cfg.pilar || "").split(",").map((p) => p.trim()).filter(Boolean);
  const infraList = (cfg.infrastructure || "").split("\n").map((l) => l.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-16 md:space-y-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2rem] h-[450px] md:h-[600px] flex items-center">
          <div className="absolute inset-0 z-0">
            {cfg.hero_photo ? <img alt="Sampul" className="w-full h-full object-cover" src={cfg.hero_photo} /> : <div className="w-full h-full bg-gradient-to-br from-blue-700 to-blue-400"></div>}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent"></div>
          </div>
          <div className="relative z-10 px-6 md:px-12 max-w-2xl text-white">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-widest uppercase mb-4 md:mb-6">SMA NEGERI 1 TAPA</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-4 md:mb-6 leading-[1.1]">
              <div className="opacity-80">{(cfg.hero_theme || "SMA Hebat - Maju Semua").split(" - ")[0]} -</div>
              <div className="text-white">{(cfg.hero_theme || "SMA Hebat - Maju Semua").split(" - ")[1] || ""}</div>
            </h1>
            <p className="text-base md:text-lg opacity-90 leading-relaxed font-medium">{cfg.hero_desc || ""}</p>
          </div>
        </section>

        {/* Principal's Message & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-5 relative w-full">
            <div className="w-full h-[380px] sm:h-[420px] lg:h-full min-h-[400px] rounded-[3rem] overflow-hidden border-[6px] md:border-[8px] border-blue-100 shadow-xl bg-blue-50">
              {cfg.kepsek_photo ? <img alt="Kepala Sekolah" className="w-full h-full object-cover object-top" src={cfg.kepsek_photo} /> : <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center"><span className="material-symbols-outlined text-white text-8xl">person</span></div>}
            </div>
            <div className="relative mt-4 mx-4 bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(23,91,184,0.15)] max-w-full md:max-w-xs border border-blue-50 z-10 md:absolute md:-bottom-8 md:-right-6 md:mt-0 md:mx-0">
              <p className="text-black text-sm md:text-base font-bold italic leading-relaxed">&ldquo;{cfg.kepsek_quote || "Sambutan dari Kepala Sekolah."}&rdquo;</p>
              <div className="mt-4">
                <p className="font-extrabold text-black text-sm md:text-base">{cfg.kepsek_name || "Nama Kepala Sekolah"}</p>
                <p className="text-[10px] md:text-xs text-blue-700 font-bold uppercase tracking-wider mt-0.5">Kepala Sekolah</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-blue-700 to-blue-400 rounded-[2.5rem] p-8 md:p-10 text-white hover:scale-[1.02] transition-transform shadow-lg border border-blue-500/20">
              <div className="flex items-center gap-4 mb-4 md:mb-6">
                <span className="material-symbols-outlined text-3xl md:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                <h4 className="text-xl md:text-2xl font-bold">Visi Kami</h4>
              </div>
              <p className="opacity-90 leading-relaxed text-sm md:text-base">{cfg.visi || "Visi sekolah belum dikonfigurasi."}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-800 to-blue-500 rounded-[2.5rem] p-8 md:p-10 text-white hover:scale-[1.02] transition-transform shadow-lg border border-blue-600/20">
              <div className="flex items-center gap-4 mb-4 md:mb-6">
                <span className="material-symbols-outlined text-3xl md:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                <h4 className="text-xl md:text-2xl font-bold">Misi Kami</h4>
              </div>
              <div className="opacity-90 leading-relaxed text-sm md:text-base whitespace-pre-line">{cfg.misi || "Misi sekolah belum dikonfigurasi."}</div>
            </div>
            {pilarList.length > 0 && (
              <div className="bg-blue-50 rounded-[2.5rem] p-8 md:p-10 text-blue-900 relative overflow-hidden flex items-center shadow-sm border border-blue-100">
                <div className="flex-1 relative z-10">
                  <h4 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-blue-800">Pilar Utama Sekolah</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    {pilarList.map((p, i) => (
                      <div key={i} className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-blue-700"></span><span className="font-bold">{p}</span></div>
                    ))}
                  </div>
                </div>
                <div className="hidden md:block absolute -right-8 opacity-10 transform rotate-12"><span className="material-symbols-outlined text-[14rem] text-blue-700">ac_unit</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Campus Map */}
        <section className="space-y-8 md:space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-blue-900">Denah Sekolah</h2>
              <p className="text-blue-800 max-w-xl text-sm md:text-base">Dilengkapi dengan infrastruktur penunjang kegiatan belajar yang nyaman dan kondusif.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-blue-50 border border-blue-100 px-6 py-4 rounded-full flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-700">location_on</span>
                <span className="text-sm font-bold text-blue-900">{cfg.location_name || "Bone Bolango, Gorontalo"}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="lg:col-span-3 h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
              {cfg.map_link && cfg.map_link.includes("google") ? (
                cfg.map_link.includes("/embed") ? (
                  <iframe src={cfg.map_link} className="w-full h-full border-0" allowFullScreen loading="lazy"></iframe>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex flex-col items-center justify-center p-6 text-center">
                    <span className="material-symbols-outlined text-white text-6xl mb-4">map</span>
                    <h3 className="text-white font-bold text-xl mb-2">Lokasi Sekolah</h3>
                    <p className="text-blue-50 text-sm mb-6">Peta interaktif tidak dapat ditampilkan secara langsung.</p>
                    <a href={cfg.map_link} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-700 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-blue-50 transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined">open_in_new</span> Buka di Google Maps
                    </a>
                  </div>
                )
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex flex-col items-center justify-center"><span className="material-symbols-outlined text-white text-8xl mb-4">map</span><span className="text-white font-bold">Peta Belum Tersedia</span></div>
              )}
            </div>
            <div className="space-y-6">
              {infraList.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 p-6 md:p-8 rounded-[2rem] space-y-4">
                  <h5 className="text-lg font-bold text-blue-900">Infrastruktur</h5>
                  <ul className="space-y-4">
                    {infraList.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-blue-700 font-bold text-sm">{String(i + 1).padStart(2, "0")}</span>
                        <p className="text-sm font-bold text-blue-900">{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="bg-blue-700 p-6 md:p-8 rounded-[2rem] text-white flex flex-col items-center text-center shadow-lg">
                <span className="material-symbols-outlined text-4xl mb-4 text-blue-200">directions_bus</span>
                <p className="text-sm font-bold mb-2">Akses Kendaraan</p>
                <p className="text-xs opacity-80">Transportasi ke area depan sekolah beroperasi rutin.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-900 rounded-[2rem] p-10 md:p-16 text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"><div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500 rounded-full blur-[80px]"></div><div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-400 rounded-full blur-[80px]"></div></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 md:mb-6">Siap bergabung dengan SMA Hebat?</h2>
            <p className="text-blue-100 mb-8 md:mb-10 max-w-2xl mx-auto text-sm md:text-base">Pendaftaran peserta didik baru akan segera dibuka. Nantikan segala bentuk informasi melalui web resmi SMA Negeri 1 Tapa. Adapun pertanyaan yang ingin ditanyakan bisa melalui halaman &ldquo;Kontak Kami&rdquo; atau klik tombol di bawah.</p>
            <Link href="/kontak" className="bg-white text-blue-700 px-8 md:px-10 py-3 md:py-4 rounded-full font-bold hover:scale-105 transition-all shadow-lg inline-block">Kontak Kami</Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-blue-50 rounded-t-[2rem] md:rounded-t-[3rem] w-full mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:flex lg:justify-between items-start px-6 md:px-12 py-12 md:py-16 gap-10 md:gap-12 max-w-7xl mx-auto text-sm">
          <div className="max-w-xs space-y-4"><div className="flex items-center gap-3"><Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" /><div className="text-xl font-extrabold text-blue-700">SMA N 1 Tapa</div></div><p className="text-blue-800 text-xs md:text-sm">Membentuk siswa unggul, kompeten, dan berkepribadian baik.</p></div>
          <div className="grid grid-cols-2 gap-8 md:gap-16 w-full lg:w-auto"><div className="space-y-4"><h5 className="font-bold text-blue-700">Jelajahi</h5><div className="flex flex-col gap-2"><Link href="/galeri" className="text-blue-700 hover:text-blue-600 transition-colors">Galeri</Link><Link href="/organisasi" className="text-blue-700 hover:text-blue-600 transition-colors">Organisasi</Link><Link href="/direktori" className="text-blue-700 hover:text-blue-600 transition-colors">Direktori</Link></div></div><div className="space-y-4"><h5 className="font-bold text-blue-700">Legal</h5><div className="flex flex-col gap-2"><Link href="/kontak" className="text-blue-700 hover:text-blue-600 transition-colors">Kontak</Link></div></div></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 md:pb-12"><div className="pt-8 border-t border-blue-200 text-center"><div className="text-blue-700 text-xs">© {new Date().getFullYear()} SMA Negeri 1 Tapa. Terus Maju Bersama.</div></div></div>
      </footer>
    </>
  );
}
