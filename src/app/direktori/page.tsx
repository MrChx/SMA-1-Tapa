import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Direktori() {
  const allMembers = await prisma.directoryMember.findMany({ orderBy: { createdAt: "asc" } });

  const guru = allMembers.filter((m) => m.category === "Guru");
  const staf = allMembers.filter((m) => m.category === "Staf");
  const siswa = allMembers.filter((m) => m.category === "Siswa");

  const sections = [
    { name: "Tenaga Pendidik", sub: "Guru & Pengajar", icon: "school", members: guru },
    { name: "Staf Jajaran", sub: "Tenaga Kependidikan", icon: "badge", members: staf },
    { name: "Siswa", sub: "Duta Sekolah", icon: "emoji_events", members: siswa },
  ];

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <header className="mb-24 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/40 blur-[100px] rounded-full"></div>
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-sm tracking-widest mb-6">KOMUNITAS KAMI</span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-blue-950 mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">Direktori.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-800 leading-relaxed">Ayo kenalan dengan warga SMA Negeri 1 Tapa.</p>
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

      {/* Footer */}
      <footer className="bg-blue-50 rounded-t-[2rem] md:rounded-t-[3rem] w-full mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:flex lg:justify-between items-start px-6 md:px-12 py-12 md:py-16 gap-10 md:gap-12 max-w-7xl mx-auto text-sm">
          <div className="max-w-xs space-y-4"><div className="flex items-center gap-3"><Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" /><div className="text-xl font-extrabold text-blue-700">SMA N 1 Tapa</div></div></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 md:pb-12"><div className="pt-8 border-t border-blue-200 text-center"><div className="text-blue-700 text-xs">© {new Date().getFullYear()} SMA Negeri 1 Tapa.</div></div></div>
      </footer>
    </>
  );
}
