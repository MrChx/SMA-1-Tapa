import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DirektoriGuru() {
  const guru = await prisma.directoryMember.findMany({
    where: { category: "Guru" },
    orderBy: { createdAt: "asc" },
  });
  const staf = await prisma.directoryMember.findMany({
    where: { category: "Staf" },
    orderBy: { createdAt: "asc" },
  });

  const sections = [
    { name: "Tenaga Pendidik", sub: "Guru & Pengajar", icon: "school", members: guru },
    { name: "Staf Jajaran", sub: "Tenaga Kependidikan", icon: "badge", members: staf },
  ];

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <header className="mb-16 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/40 blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <Link href="/direktori" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm mb-8 group">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span> Kembali ke Direktori
            </Link>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-blue-950 mb-4">
              <span className="bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">Guru & Staf</span>
            </h1>
            <p className="text-blue-800 text-lg">Tenaga pendidik dan kependidikan SMA Negeri 1 Tapa.</p>
          </div>
        </header>

        {sections.map((section) => (
          <section key={section.name} className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700"><span className="material-symbols-outlined text-2xl">{section.icon}</span></div>
              <div><h2 className="text-2xl md:text-3xl font-bold text-blue-950">{section.name}</h2><p className="text-blue-700 text-sm">{section.sub}</p></div>
            </div>

            {section.members.length === 0 ? (
              <div className="text-center py-12 text-blue-400 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">person_off</span>
                <p className="font-bold text-sm">Belum ada data untuk kategori ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {section.members.map((m) => (
                  <div key={m.id} className="bg-white rounded-[1.5rem] p-6 border border-blue-100 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 text-center group">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden mx-auto mb-4 border-4 border-blue-50 shadow-md bg-blue-100">
                      {m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-blue-300 text-4xl">person</span></div>}
                    </div>
                    <h3 className="font-bold text-blue-950 text-sm md:text-base group-hover:text-blue-700 transition-colors">{m.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold mt-1 bg-blue-50 px-3 py-1 rounded-full inline-block border border-blue-100">{m.role}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </main>

      <footer className="bg-blue-50 rounded-t-[2rem] w-full mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8"><div className="text-center text-blue-700 text-xs">© {new Date().getFullYear()} SMA Negeri 1 Tapa.</div></div>
      </footer>
    </>
  );
}
