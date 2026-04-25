"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => {
          setResults(data.results || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [query]);

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">Hasil Pencarian</span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-blue-950 mb-4 tracking-tight">
          Menampilkan hasil untuk <span className="text-blue-600">"{query}"</span>
        </h1>
        <p className="text-blue-700/70">Ditemukan {results.length} item yang relevan dengan kata kunci Anda.</p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-blue-300 animate-spin">progress_activity</span>
          <p className="text-blue-400 font-medium tracking-wide">Mencari data...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {results.map((res, i) => (
            <Link 
              href={res.link} 
              key={i}
              className="bg-white border border-blue-100 p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-tighter shadow-sm border border-blue-100">
                    {res.type}
                  </span>
                  <span className="text-sm font-semibold text-blue-400">{res.sub}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-blue-950 group-hover:text-blue-700 transition-colors">{res.title}</h3>
                {res.desc && <p className="text-blue-800/70 text-sm line-clamp-2 max-w-2xl">{res.desc}</p>}
              </div>
              <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                <span className="material-symbols-outlined text-2xl">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-blue-50/50 rounded-[3rem] p-12 md:p-20 border border-dashed border-blue-200 text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-5xl text-blue-200">search_off</span>
          </div>
          <div className="max-w-sm mx-auto space-y-2">
            <h3 className="text-xl font-bold text-blue-900">Ups, tidak ada kecocokan</h3>
            <p className="text-blue-700/60 text-sm">Cobalah mencari dengan kata kunci lain atau periksa kembali ejaan Anda.</p>
          </div>
          <Link href="/" className="inline-block bg-blue-700 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-800 transition-all shadow-lg active:scale-95">
            Kembali ke Beranda
          </Link>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-blue-400">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
