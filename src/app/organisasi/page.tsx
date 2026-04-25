import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Organisasi() {
  const allMembers = await prisma.organizationMember.findMany({ orderBy: { createdAt: "asc" } });

  const osis = allMembers.filter((m) => m.organization === "OSIS");
  const rohis = allMembers.filter((m) => m.organization === "Rohis");
  const pramuka = allMembers.filter((m) => m.organization === "Pramuka");

  const sections = [
    { name: "OSIS", full: "Organisasi Siswa Intra Sekolah", logoUrl: "/osis.png", members: osis },
    { name: "Rohis", full: "Rohani Islam", logoUrl: "/rohis.jpeg", members: rohis },
    { name: "Pramuka", full: "Gerakan Pramuka", logoUrl: "/pramuka.png", members: pramuka },
  ];

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Hero Section */}
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

        {sections.map((section) => (
          <section key={section.name} className="mb-32 relative z-10">
            <div className="flex items-center gap-6 mb-12">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-blue-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                <img src={section.logoUrl} alt={`Logo ${section.name}`} className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-blue-950">{section.name}</h2>
                <p className="text-blue-700 font-medium text-sm md:text-base">{section.full}</p>
              </div>
            </div>

            {section.members.length === 0 ? (
              <div className="text-center py-16 text-blue-400 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">group_off</span>
                <p className="font-bold">Belum ada anggota terdaftar untuk {section.name}.</p>
              </div>
            ) : (
              <>
                {/* Leader card (first member) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                  <div className="md:col-span-4 group h-full">
                    <div className="h-full bg-white border border-blue-100 rounded-[2rem] p-8 overflow-hidden relative shadow-[0_20px_40px_rgba(23,91,184,0.03)] hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
                      <div className="absolute top-0 right-0 p-8 text-blue-50"><span className="material-symbols-outlined text-[6rem] md:text-[8rem]">shield</span></div>
                      <div className="relative z-10 flex flex-col items-center md:items-start">
                        <div className="mb-8 w-40 h-40 md:w-48 md:h-48 rounded-[1.5rem] overflow-hidden border-4 border-blue-50 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500 bg-blue-100">
                          {section.members[0].photoUrl ? (
                            <img className="w-full h-full object-cover" src={section.members[0].photoUrl} alt={section.members[0].name} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-blue-300 text-6xl">person</span></div>
                          )}
                        </div>
                        <span className="px-4 py-1.5 rounded-full bg-blue-700 text-white font-bold text-[10px] md:text-xs uppercase tracking-tighter mb-4 inline-block shadow-md">{section.members[0].role}</span>
                        <h3 className="text-2xl md:text-3xl font-bold text-blue-950 mb-3 text-center md:text-left">{section.members[0].name}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Member grid (remaining members) */}
                  <div className="md:col-span-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      {section.members.slice(1).map((m) => (
                        <div key={m.id} className="bg-white rounded-[1.5rem] p-3 md:p-5 border border-blue-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
                          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden mb-3 border-2 border-blue-50 shadow-sm bg-blue-100">
                            {m.photoUrl ? <img className="w-full h-full object-cover" src={m.photoUrl} alt={m.name} /> : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-blue-300 text-3xl">person</span></div>}
                          </div>
                          <h4 className="text-sm md:text-base font-bold text-blue-950 mb-1 group-hover:text-blue-700 transition-colors">{m.name}</h4>
                          <span className="text-[10px] md:text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-0.5 rounded-full border border-blue-100">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-blue-50 rounded-t-[2rem] md:rounded-t-[3rem] w-full mt-12 md:mt-20">
        <div className="grid grid-cols-1 lg:flex lg:justify-between items-start px-6 md:px-12 py-12 md:py-16 gap-10 md:gap-12 max-w-7xl mx-auto text-sm">
          <div className="max-w-xs space-y-4"><div className="flex items-center gap-3"><Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" /><div className="text-xl font-extrabold text-blue-700">SMA N 1 Tapa</div></div><p className="text-blue-800 text-xs md:text-sm">Membentuk siswa unggul, kompeten, dan berkepribadian baik.</p></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8 md:pb-12"><div className="pt-8 border-t border-blue-200 text-center"><div className="text-blue-700 text-xs">© {new Date().getFullYear()} SMA Negeri 1 Tapa.</div></div></div>
      </footer>
    </>
  );
}
