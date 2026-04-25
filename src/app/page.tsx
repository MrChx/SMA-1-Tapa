import Link from "next/link";
import { prisma } from "@/lib/prisma";
import LabVideoPlayer from "@/components/LabVideoPlayer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const rows = await prisma.siteConfig.findMany();
  const cfg: Record<string, string> = {};
  for (const r of rows) cfg[r.key] = r.value;

  const stats = [
    { value: cfg.stat1_value || "A", label: cfg.stat1_label || "Akreditas", className: "bg-white text-blue-700 border-2 border-blue-100 shadow-lg" },
    { value: cfg.stat2_value || "55", label: cfg.stat2_label || "Jumlah Guru", className: "bg-blue-700 text-white shadow-lg" },
    { value: cfg.stat3_value || "150", label: cfg.stat3_label || "Jumlah Siswa", className: "bg-white text-blue-700 border-2 border-blue-100 shadow-lg" },
    { value: cfg.stat4_value || "#1", label: cfg.stat4_label || "Penghargaan", className: "bg-blue-700 text-white shadow-lg" },
  ];

  const newsIds = [cfg.kabar_link1, cfg.kabar_link2].filter(Boolean);
  const linkedNews = newsIds.length > 0
    ? await prisma.galleryItem.findMany({ where: { id: { in: newsIds } } })
    : [];

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        <section className="relative overflow-hidden rounded-xl bg-blue-50 p-8 md:p-16 lg:p-24 flex flex-col items-center text-center mb-16 md:mb-20">
          {(cfg.hero_bg_desktop || cfg.hero_bg_mobile) && (
            <div className="absolute inset-0 z-0">
              <img src={cfg.hero_bg_desktop || cfg.hero_bg_mobile} alt="Hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-white/70"></div>
            </div>
          )}
          {!cfg.hero_bg_desktop && !cfg.hero_bg_mobile && (
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-700 via-blue-500 to-blue-200"></div>
            </div>
          )}
          <div className="relative z-10 space-y-6 md:space-y-8 max-w-4xl text-center mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm text-blue-700 text-xs font-bold tracking-widest uppercase animate-[fadeInDown_0.6s_ease-out]">SMA Negeri 1 Tapa</span>
            <h1 className="text-4xl md:text-5xl lg:text-8xl font-black tracking-tighter leading-[1] drop-shadow-sm">
              <div className="text-blue-950">
                {(cfg.hero_theme || "SMA Hebat - Maju Semua").split(" - ")[0]} -
              </div>
              <div className="bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent mt-1">
                {(cfg.hero_theme || "SMA Hebat - Maju Semua").split(" - ")[1] || ""}
              </div>
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-blue-800 leading-relaxed max-w-2xl mx-auto font-medium opacity-90">
              {(cfg.hero_desc || "Menumbuhkan pemikir, kreator, dan inovator masa depan melalui perpaduan teknologi dan keunggulan akademik klasik.")}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 pt-4">
              <Link href="/profil" className="bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-base md:text-lg hover:scale-105 hover:shadow-xl hover:shadow-blue-700/20 active:scale-95 transition-all flex items-center justify-center">Profil Sekolah</Link>
              <Link href="/kontak" className="bg-white text-blue-700 px-10 py-4 rounded-full font-bold text-base md:text-lg hover:bg-blue-50 transition-all border border-blue-100 flex items-center justify-center shadow-sm">Kontak Kami</Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 md:mt-20 w-full relative z-10">
            {stats.map((s, i) => (
              <div key={i} className={`${s.className} p-6 rounded-lg flex flex-col items-center justify-center min-h-[120px] ${i % 2 === 1 ? "transform translate-y-4 md:translate-y-8" : ""}`}>
                <span className="text-2xl md:text-3xl font-black">{s.value}</span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-tighter opacity-80 text-center mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 md:mb-24">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-blue-700">Kabar Akademik</h2>
              <p className="text-blue-700">Pembaruan dari ekosistem kampus kami.</p>
            </div>
            <Link href="/galeri" className="text-blue-600 font-bold flex items-center gap-2 group">
              Lihat Semua Berita
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            <div className="md:col-span-7 group relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-shadow cursor-pointer">
              <div className="h-72 md:h-96 w-full overflow-hidden">
                {cfg.kabar_photo ? (
                  <img src={cfg.kabar_photo} alt={cfg.kabar_title || "Kabar"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center"><span className="material-symbols-outlined text-white text-6xl">newspaper</span></div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-blue-900/90 to-transparent text-white">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-xs font-bold mb-3 md:mb-4 inline-block">KEUNGGULAN AKADEMIK</span>
                <h3 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{cfg.kabar_title || "Berita Terbaru"}</h3>
                <p className="opacity-80 line-clamp-2 text-sm md:text-base">{cfg.kabar_desc || ""}</p>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col gap-6 md:gap-8">
              {linkedNews.length > 0 ? linkedNews.map((news, i) => (
                <Link href={`/galeri/${news.id}`} key={news.id} className={`flex-1 ${i === 0 ? "bg-blue-50/50 border-blue-100" : "bg-blue-100/40 border-blue-200"} p-6 md:p-8 rounded-xl flex flex-col justify-center border group cursor-pointer hover:bg-blue-100/50 transition-colors`}>
                  <span className="text-blue-700 font-bold text-xs uppercase tracking-widest mb-2">{news.category}</span>
                  <h4 className="text-lg md:text-xl font-bold text-blue-700 mb-2 md:mb-3 group-hover:opacity-80 transition-colors">{news.title}</h4>
                  <p className="text-blue-700 text-xs md:text-sm line-clamp-2">{news.summary}</p>
                </Link>
              )) : (
                <>
                  <div className="flex-1 bg-blue-50/50 p-6 md:p-8 rounded-xl flex flex-col justify-center border border-blue-100">
                    <span className="text-blue-700 font-bold text-xs uppercase tracking-widest mb-2">Kehidupan Siswa</span>
                    <h4 className="text-lg md:text-xl font-bold text-blue-700 mb-2">Tambahkan berita baru di admin</h4>
                    <p className="text-blue-700 text-xs">Belum ada berita galeri yang ditautkan.</p>
                  </div>
                  <div className="flex-1 bg-blue-100/40 p-6 md:p-8 rounded-xl flex flex-col justify-center border border-blue-200">
                    <span className="text-blue-700 font-bold text-xs uppercase tracking-widest mb-2">Pendaftaran</span>
                    <h4 className="text-lg md:text-xl font-bold text-blue-700 mb-2">Kelola di Admin → Beranda</h4>
                    <p className="text-blue-700 text-xs">Pilih berita galeri yang ingin ditampilkan.</p>
                  </div>
                </>
              )}
            </div>

            <div className="md:col-span-4 bg-blue-50 p-8 rounded-xl flex flex-col items-center text-center border border-blue-100">
              <span className="material-symbols-outlined text-4xl md:text-5xl text-blue-700 mb-3 md:mb-4">school</span>
              <h5 className="text-xl md:text-2xl font-bold text-blue-700">Unggulan Bone Bolango</h5>
              <p className="text-blue-700 mt-2 text-sm md:text-base">Menjadi peminat nomor 1 sekolah menengah atas di Bone Bolango.</p>
            </div>
            <div className="md:col-span-4 bg-blue-50 p-8 rounded-xl flex flex-col items-center text-center border border-blue-100">
              <span className="material-symbols-outlined text-4xl md:text-5xl text-blue-600 mb-3 md:mb-4">public</span>
              <h5 className="text-xl md:text-2xl font-bold text-blue-700">Jejaring Daerah</h5>
              <p className="text-blue-700 mt-2 text-sm md:text-base">Akses program kunjungan, belajar bersama dan kemitraan antar sekolah di daerah Gorontalo.</p>
            </div>
            <div className="md:col-span-4 bg-blue-50 p-8 rounded-xl flex flex-col items-center text-center border border-blue-100">
              <span className="material-symbols-outlined text-4xl md:text-5xl text-blue-700 mb-3 md:mb-4">rocket_launch</span>
              <h5 className="text-xl md:text-2xl font-bold text-blue-700">{cfg.lab_title || "Laboratorium Inovasi"}</h5>
              <p className="text-blue-700 mt-2 text-sm md:text-base">{cfg.lab_desc || "Siswa kami telah menciptakan berbagai proyek inovatif."}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-16 md:mb-24">
          <div className="order-2 lg:order-1 relative">
            <div className="aspect-square bg-gradient-to-tr from-blue-200 to-blue-500 rounded-xl overflow-hidden relative shadow-2xl group">
              <LabVideoPlayer title={cfg.lab_title || "Laboratorium Sekolah"} videoUrl={cfg.lab_video || ""} />

              <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 rounded-xl"></div>
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-4 md:space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-700">{cfg.lab_title || "Laboratorium Hidup untuk Masa Depan"}</h2>
            <p className="text-base md:text-lg text-blue-700 leading-relaxed">{cfg.lab_desc || "SMA Negeri 1 Tapa bukan sekadar tempat belajar."}</p>
            <ul className="space-y-4 pt-2">
              {cfg.lab_fitur1 && (
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 mt-1">check_circle</span>
                  <div><p className="font-bold text-blue-700">{cfg.lab_fitur1}</p></div>
                </li>
              )}
              {cfg.lab_fitur2 && (
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-600 mt-1">check_circle</span>
                  <div><p className="font-bold text-blue-700">{cfg.lab_fitur2}</p></div>
                </li>
              )}
            </ul>
          </div>
        </section>
      </main>

      <footer className="bg-blue-50 rounded-t-[2rem] md:rounded-t-[3rem] w-full mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:flex lg:justify-between items-start px-6 md:px-12 py-12 md:py-16 gap-10 md:gap-12 max-w-7xl mx-auto text-sm leading-relaxed">
          <div className="max-w-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-xl font-extrabold text-blue-700">SMA N 1 Tapa</div>
            </div>
            <p className="text-blue-700 text-xs md:text-sm">Institusi terkemuka yang didedikasikan untuk persimpangan antara kreativitas dan penguasaan ilmu pengetahuan.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:gap-16 w-full lg:w-auto">
            <div className="space-y-4"><h5 className="font-bold text-blue-700">Jelajahi</h5><ul className="space-y-2"><li><Link href="/profil" className="text-blue-700 hover:text-blue-600 transition-colors">Profil</Link></li><li><Link href="/galeri" className="text-blue-700 hover:text-blue-600 transition-colors">Galeri</Link></li><li><Link href="/organisasi" className="text-blue-700 hover:text-blue-600 transition-colors">Organisasi</Link></li></ul></div>
            <div className="space-y-4"><h5 className="font-bold text-blue-700">Lainnya</h5><ul className="space-y-2"><li><Link href="/direktori" className="text-blue-700 hover:text-blue-600 transition-colors">Direktori</Link></li><li><Link href="/kontak" className="text-blue-700 hover:text-blue-600 transition-colors">Kontak</Link></li></ul></div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 md:pb-12">
          <div className="pt-8 border-t border-blue-200 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div className="text-blue-700 text-xs">© {new Date().getFullYear()} SMA Negeri 1 Tapa. Terus Maju Bersama.</div>
          </div>
        </div>
      </footer>
    </>
  );
}
