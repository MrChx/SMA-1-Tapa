import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function GaleriDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-8 py-16">
      <Link href="/galeri" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-8 hover:underline">
        <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali ke Galeri
      </Link>

      {item.thumbnailUrl && (
        <div className="w-full h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden mb-10 shadow-lg border-4 border-white">
          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
        </div>
      )}

      <span className="text-blue-700 font-bold text-xs uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-md inline-block mb-4 border border-blue-100">{item.category}</span>

      <h1 className="text-3xl md:text-5xl font-extrabold text-blue-950 tracking-tight mb-6 leading-tight">{item.title}</h1>

      <p className="text-blue-700 text-lg leading-relaxed mb-10 border-l-4 border-blue-300 pl-6 italic">{item.summary}</p>

      <article className="prose prose-blue max-w-none text-blue-900 leading-relaxed text-base md:text-lg whitespace-pre-line">
        {item.content}
      </article>

      <div className="mt-16 pt-8 border-t border-blue-100 flex justify-between items-center">
        <p className="text-xs text-blue-500 font-bold">{new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
        <Link href="/galeri" className="bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-800 transition-colors shadow-lg shadow-blue-700/20">
          Galeri Lainnya
        </Link>
      </div>
    </main>
  );
}
