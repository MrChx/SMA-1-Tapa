import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Galeri() {
  const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Hero Section */}
        <header className="mb-20 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs tracking-widest uppercase">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Merekam Memori
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter max-w-4xl mx-auto leading-[1.1]">
            <span className="bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">Galeri Kegiatan</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-800 max-w-2xl mx-auto leading-relaxed">
            Jelajahi berbagai ragam aktivitas penuh kenangan, di mana inovasi bertemu dengan tradisi.
          </p>
        </header>

        {/* Gallery Grid */}
        {items.length === 0 ? (
          <div className="text-center py-20 text-blue-400">
            <span className="material-symbols-outlined text-6xl mb-4 block opacity-40">collections</span>
            <p className="font-bold text-lg">Belum ada kegiatan yang diunggah.</p>
            <p className="text-sm mt-2">Admin dapat menambahkan kegiatan melalui panel admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_20px_40px_rgba(23,91,184,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="relative overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      alt={item.title}
                      className="h-64 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={item.thumbnailUrl}
                    />
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <span className="material-symbols-outlined text-4xl text-blue-400">image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <span className="mb-3 inline-block rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-700 md:text-xs">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-bold leading-tight text-blue-950">{item.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-blue-800">{item.summary}</p>
                  <Link
                    href={`/galeri/${item.id}`}
                    className="mt-auto block w-full rounded-lg border border-blue-100 bg-blue-50 py-2.5 text-center text-sm font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-100"
                  >
                    Baca Selengkapnya &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-50 rounded-t-[2rem] md:rounded-t-[3rem] w-full mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:flex lg:justify-between items-start px-6 md:px-12 py-12 md:py-16 gap-10 md:gap-12 max-w-7xl mx-auto text-sm">
          <div className="max-w-xs space-y-4"><div className="flex items-center gap-3"><Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" /><div className="text-xl font-extrabold text-blue-700">SMA N 1 Tapa</div></div><p className="text-blue-800 text-xs md:text-sm">Membentuk siswa unggul, kompeten, dan berkepribadian baik.</p></div>
          <div className="grid grid-cols-2 gap-8 md:gap-16 w-full lg:w-auto"><div className="space-y-4"><h5 className="font-bold text-blue-700">Jelajahi</h5><div className="flex flex-col gap-2"><Link href="/profil" className="text-blue-700 hover:text-blue-600 transition-colors">Profil</Link><Link href="/organisasi" className="text-blue-700 hover:text-blue-600 transition-colors">Organisasi</Link></div></div><div className="space-y-4"><h5 className="font-bold text-blue-700">Legal</h5><div className="flex flex-col gap-2"><Link href="/kontak" className="text-blue-700 hover:text-blue-600 transition-colors">Kontak</Link></div></div></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 md:pb-12"><div className="pt-8 border-t border-blue-200 text-center"><div className="text-blue-700 text-xs">© {new Date().getFullYear()} SMA Negeri 1 Tapa. Terus Maju Bersama.</div></div></div>
      </footer>
    </>
  );
}
