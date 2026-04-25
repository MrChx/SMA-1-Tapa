import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Search across multiple models concurrently
    const [news, organization, directory, faqs] = await Promise.all([
      prisma.galleryItem.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
            { content: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.organizationMember.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.directoryMember.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { role: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
      prisma.faq.findMany({
        where: {
          OR: [
            { question: { contains: query, mode: "insensitive" } },
            { answer: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
    ]);

    // Format results to be uniform
    const results = [
      ...news.map(n => ({ type: "Berita", title: n.title, sub: n.category, link: `/galeri/${n.id}`, desc: n.summary })),
      ...organization.map(o => ({ type: "Organisasi", title: o.name, sub: `${o.organization} - ${o.role}`, link: "/organisasi", desc: "" })),
      ...directory.map(d => ({ type: "Direktori", title: d.name, sub: `${d.category} - ${d.role}`, link: "/direktori", desc: "" })),
      ...faqs.map(f => ({ type: "FAQ", title: f.question, sub: "Tanya Jawab", link: "/kontak", desc: f.answer })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Gagal memproses pencarian" }, { status: 500 });
  }
}
