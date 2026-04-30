import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const ORG_MAP: Record<string, { name: string; full: string; logoUrl: string; dbKey: string }> = {
  osis: { name: "OSIS", full: "Organisasi Siswa Intra Sekolah", logoUrl: "/osis.png", dbKey: "OSIS" },
  rohis: { name: "Rohis", full: "Rohani Islam", logoUrl: "/rohis.jpeg", dbKey: "Rohis" },
  pramuka: { name: "Pramuka", full: "Gerakan Pramuka", logoUrl: "/pramuka.png", dbKey: "Pramuka" },
};

export default async function OrganisasiDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = ORG_MAP[slug];
  if (!org) notFound();

  const members = await prisma.organizationMember.findMany({
    where: { organization: org.dbKey },
    orderBy: { createdAt: "asc" },
  });

  // Get gallery items that match this org category for "berita kegiatan"
  const activities = await prisma.galleryItem.findMany({
    where: { category: { equals: org.dbKey, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Hero */}
        <header className="mb-16 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/40 blur-[100px] rounded-full"></div>
          <div className="relative z-10">
            <Link href="/organisasi" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm mb-8 group">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span> Kembali ke Organisasi
            </Link>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border border-blue-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-2">
                <img src={org.logoUrl} alt={`Logo ${org.name}`} className="w-full h-full object-contain rounded-full" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-blue-950">
                  <span className="bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">{org.name}</span>
                </h1>
                <p className="text-blue-700 font-medium text-base md:text-lg mt-1">{org.full}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Anggota Section */}
        {members.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700"><span className="material-symbols-outlined text-xl">groups</span></div>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-950">Anggota {org.name}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
              {/* Leader */}
              <div className="md:col-span-4 group h-full">
                <div className="h-full bg-white border border-blue-100 rounded-[2rem] p-8 overflow-hidden relative shadow-[0_20px_40px_rgba(23,91,184,0.03)] hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500">
                  <div className="absolute top-0 right-0 p-8 text-blue-50"><span className="material-symbols-outlined text-[6rem] md:text-[8rem]">shield</span></div>
                  <div className="relative z-10 flex flex-col items-center md:items-start">
                    <div className="mb-8 w-40 h-40 md:w-48 md:h-48 rounded-[1.5rem] overflow-hidden border-4 border-blue-50 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500 bg-blue-100">
                      {members[0].photoUrl ? (
                        <img className="w-full h-full object-cover" src={members[0].photoUrl} alt={members[0].name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-blue-300 text-6xl">person</span></div>
                      )}
                    </div>
                    <span className="px-4 py-1.5 rounded-full bg-blue-700 text-white font-bold text-[10px] md:text-xs uppercase tracking-tighter mb-4 inline-block shadow-md">{members[0].role}</span>
                    <h3 className="text-2xl md:text-3xl font-bold text-blue-950 mb-3 text-center md:text-left">{members[0].name}</h3>
                  </div>
                </div>
              </div>

              {/* Other members */}
              <div className="md:col-span-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {members.slice(1).map((m) => (
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
          </section>
        )}

        {/* Berita Kegiatan Section */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700"><span className="material-symbols-outlined text-xl">newspaper</span></div>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-950">Berita & Kegiatan {org.name}</h2>
          </div>

          {activities.length === 0 ? (
            <div className="text-center py-16 text-blue-400 bg-blue-50/50 rounded-[2rem] border border-blue-100">
              <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">article</span>
              <p className="font-bold">Belum ada berita kegiatan {org.name}.</p>
              <p className="text-sm mt-2">Admin dapat menambahkan kegiatan melalui panel Galeri dengan kategori &ldquo;{org.dbKey}&rdquo;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.map((item) => (
                <article key={item.id} className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-blue-100 bg-white shadow-[0_20px_40px_rgba(23,91,184,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="relative overflow-hidden">
                    {item.thumbnailUrl ? (
                      <img alt={item.title} className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105" src={item.thumbnailUrl} />
                    ) : (
                      <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <span className="material-symbols-outlined text-4xl text-blue-400">image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold leading-tight text-blue-950 mb-2">{item.title}</h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-blue-800 mb-4">{item.summary}</p>
                    <Link
                      href={`/galeri/${item.id}`}
                      className="mt-auto block w-full rounded-lg border border-blue-100 bg-blue-50 py-2.5 text-center text-sm font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-100"
                    >
                      Lihat Selengkapnya &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
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
