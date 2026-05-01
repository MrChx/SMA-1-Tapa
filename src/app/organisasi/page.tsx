import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Organisasi() {
  const orgs = [
    { slug: "osis", name: "OSIS", full: "Organisasi Siswa Intra Sekolah", logoUrl: "/osis.png", icon: "groups" },
    { slug: "rohis", name: "Rohis", full: "Rohani Islam", logoUrl: "/rohis.jpeg", icon: "mosque" },
    { slug: "pramuka", name: "Pramuka", full: "Gerakan Pramuka", logoUrl: "/pramuka.png", icon: "forest" },
    { slug: "pmr", name: "PMR", full: "Palang Merah Remaja", logoUrl: "/PMR.png", icon: "medical_services" },
    { slug: "pikr", name: "PIK-R", full: "Pusat Informasi & Konseling Remaja", logoUrl: "/PIKR.jpg", icon: "psychology" },
  ];

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <header className="mb-24 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/40 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100/40 blur-[100px] rounded-full"></div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm tracking-widest mb-6">EKOSISTEM SEKOLAH</span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-blue-950 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">Organisasi Sekolah.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-800 mb-12 leading-relaxed">
              Jelajahi berbagai organisasi siswa di SMA Negeri 1 Tapa.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {orgs.map((org) => (
            <Link
              key={org.slug}
              href={`/organisasi/${org.slug}`}
              className="group bg-white rounded-[2rem] border border-blue-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border border-blue-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-2 mb-6 group-hover:scale-110 transition-transform duration-500">
                <img src={org.logoUrl} alt={`Logo ${org.name}`} className="w-full h-full object-contain rounded-full" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-blue-950 mb-2 group-hover:text-blue-700 transition-colors">{org.name}</h2>
              <p className="text-blue-700 font-medium text-sm mb-6">{org.full}</p>
              <span className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-blue-700/20 group-hover:bg-blue-800 transition-all">
                Lihat Kegiatan <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-blue-50 rounded-t-[2rem] md:rounded-t-[3rem] w-full mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:flex lg:justify-between items-start px-6 md:px-12 py-12 md:py-16 gap-10 md:gap-12 max-w-7xl mx-auto text-sm">
          <div className="max-w-xs space-y-4"><div className="flex items-center gap-3"><Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" /><div className="text-xl font-extrabold text-blue-700">SMA N 1 Tapa</div></div></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 md:pb-12"><div className="pt-8 border-t border-blue-200 text-center"><div className="text-blue-700 text-xs">© {new Date().getFullYear()} SMA Negeri 1 Tapa.</div></div></div>
      </footer>
    </>
  );
}
