"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

type FAQ = { id: string; question: string; answer: string };

export default function Kontak() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [cfg, setCfg] = useState<Record<string, string>>({});
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("Informasi PPDB");
  const [formMessage, setFormMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch("/api/faq").then(r => r.json()).then(setFaqs);
    fetch("/api/config").then(r => r.json()).then(setCfg);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await fetch("/api/kontak/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formName, email: formEmail, subject: formSubject, message: formMessage }),
    });
    setSending(false);
    setSent(true);
    setFormName(""); setFormEmail(""); setFormMessage("");
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-24">
        <div className="mb-20 text-center lg:text-left">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-blue-950 mb-6">
            Kontak <span className="bg-gradient-to-r from-blue-700 to-blue-400 bg-clip-text text-transparent">Kami.</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-800 max-w-2xl leading-relaxed mx-auto lg:mx-0">
            Pintu gerbang kami selalu terbuka. Hubungi admin kami melalui form di bawah ini dan kami akan segera menghubungi Anda melalui email yang Anda sediakan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-7 space-y-8 flex flex-col">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(23,91,184,0.03)] border border-blue-100">
              <h2 className="text-2xl md:text-3xl font-bold mb-8 text-blue-950">Kirim Pesan</h2>
            {sent && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm mb-6 font-medium">✅ Pesan Anda berhasil terkirim!</div>}
            <form className="space-y-6" onSubmit={handleSendMessage}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Nama Lengkap</label>
                  <input value={formName} onChange={e => setFormName(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50 border border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/50 text-blue-950 transition-all outline-none" placeholder="Masukkan nama Anda" type="text" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Alamat Email</label>
                  <input value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50 border border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/50 text-blue-950 transition-all outline-none" placeholder="email@contoh.com" type="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Perihal</label>
                <div className="relative">
                  <select value={formSubject} onChange={e => setFormSubject(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50 border border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/50 text-blue-950 transition-all appearance-none cursor-pointer outline-none">
                    <option>Informasi PPDB</option><option>Program Akademik</option><option>Keperluan Alumni</option><option>Dukungan Umum</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600"><span className="material-symbols-outlined">expand_more</span></div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Pesan Anda</label>
                <textarea value={formMessage} onChange={e => setFormMessage(e.target.value)} className="w-full px-6 py-4 rounded-3xl bg-blue-50 border border-blue-100 focus:border-blue-300 focus:ring-2 focus:ring-blue-300/50 text-blue-950 transition-all outline-none resize-none" placeholder="Tuliskan pesan Anda di sini..." rows={5} required></textarea>
              </div>
              <button disabled={sending} className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white px-10 py-4 rounded-full font-bold hover:-translate-y-1 active:translate-y-0 transition-all shadow-xl shadow-blue-700/25 mt-4" type="submit">
                {sending ? "Mengirim..." : "Kirim Pesan"}
              </button>
            </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-auto">
              <div className="bg-white rounded-[1.5rem] p-8 flex flex-col items-start gap-4 border border-blue-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 relative z-10"><span className="material-symbols-outlined text-3xl">location_on</span></div>
                <div className="relative z-10"><h3 className="text-lg font-bold text-blue-950 mb-1">Kunjungi Sekolah Kami</h3><p className="text-blue-800 text-sm leading-relaxed">{cfg.cfg_address || "Alamat sekolah"}</p></div>
              </div>
              <div className="bg-white rounded-[1.5rem] p-8 flex flex-col items-start gap-4 border border-blue-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 relative z-10"><span className="material-symbols-outlined text-3xl">call</span></div>
                <div className="relative z-10"><h3 className="text-lg font-bold text-blue-950 mb-1">Layanan Telepon</h3><p className="text-blue-800 text-sm leading-relaxed">{cfg.cfg_phone || ""}<br />{cfg.cfg_hours || ""}</p></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col space-y-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-[linear-gradient(135deg,_#f2f8fc,_#ffffff)] p-6 md:p-8 shadow-sm">
              <div className="absolute -top-12 -right-10 h-36 w-36 rounded-full bg-blue-100/70 blur-3xl"></div>
              <div className="relative flex flex-col items-center text-center">
                <div className="max-w-[260px] sm:max-w-[320px]">
                  <Image
                    src="/avatars/avatar-3d.png"
                    alt="Avatar siswa SMA Negeri 1 Tapa"
                    width={420}
                    height={420}
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                    Sahabat Layanan
                  </span>
                  <h2 className="text-2xl font-extrabold text-blue-950 md:text-3xl">Siap Membantu Anda</h2>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-blue-800 md:text-base">
                    Tim kami siap menjawab pertanyaan seputar sekolah, layanan akademik, dan informasi umum dengan cepat dan ramah.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative flex-1 w-full min-h-[400px] rounded-[2rem] overflow-hidden shadow-sm group border-4 border-white bg-blue-100">
              {cfg.cfg_map_link && cfg.cfg_map_link.includes("google") ? (
                cfg.cfg_map_link.includes("/embed") ? (
                  <iframe src={cfg.cfg_map_link} className="w-full h-full border-0" allowFullScreen loading="lazy"></iframe>
                ) : (
                  <div className="w-full h-full bg-white flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-blue-500 text-4xl">map</span>
                    </div>
                    <h3 className="text-blue-950 font-bold text-xl mb-2">Lokasi Tersemat</h3>
                    <p className="text-blue-800/70 text-sm mb-6 max-w-sm">Peta interaktif belum menggunakan format tautan semat (embed). Silakan buka peta secara langsung pada layanan eksternal.</p>
                    <a href={cfg.cfg_map_link} target="_blank" rel="noopener noreferrer" className="bg-blue-700 text-white px-8 py-3.5 rounded-full font-bold shadow-xl shadow-blue-700/20 hover:-translate-y-1 hover:shadow-2xl transition-all flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl">open_in_new</span> Buka di Google Maps
                    </a>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center"><div className="bg-white/90 backdrop-blur-xl px-6 py-4 rounded-full shadow-2xl flex items-center gap-3"><span className="material-symbols-outlined text-blue-700">location_on</span><span className="font-bold text-blue-950">Bone Bolango, ID</span></div></div>
              )}
            </div>
          </div>
        </div>

        {faqs.length > 0 && (
          <section className="mt-32">
            <div className="text-center mb-16">
              <span className="bg-blue-50 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-block">Pusat Bantuan</span>
              <h2 className="text-3xl md:text-4xl mt-4 text-blue-950 font-extrabold max-w-2xl mx-auto">Pertanyaan yang Sering Diajukan</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq) => (
                <div key={faq.id} className="p-8 bg-white border border-blue-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-center mb-4 gap-4">
                    <h4 className="text-lg font-bold text-blue-950 leading-tight">{faq.question}</h4>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors"><span className="material-symbols-outlined text-blue-700">add</span></div>
                  </div>
                  <p className="text-blue-800 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
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
