"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/Toast";
import { useConfirm } from "@/components/ConfirmModal";

type Message = { id: string; name: string; email: string; subject: string; message: string; createdAt: string; isRead: boolean };
type FAQ = { id: string; question: string; answer: string };

export default function AdminKontak() {
  const [activeTab, setActiveTab] = useState<"Kotak Masuk" | "Info Konfigurasi" | "Kelola FAQ">("Kotak Masuk");
  const [messages, setMessages] = useState<Message[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [cfgAddress, setCfgAddress] = useState("");
  const [cfgPhone, setCfgPhone] = useState("");
  const [cfgHours, setCfgHours] = useState("");
  const [cfgMapLink, setCfgMapLink] = useState("");

  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqMode, setFaqMode] = useState<"create" | "edit">("create");
  const [faqId, setFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [msgRes, faqRes, cfgRes] = await Promise.all([fetch("/api/kontak/messages"), fetch("/api/faq"), fetch("/api/config")]);
    setMessages(await msgRes.json());
    setFaqs(await faqRes.json());
    const cfg = await cfgRes.json();
    setCfgAddress(cfg.cfg_address || "");
    setCfgPhone(cfg.cfg_phone || "");
    setCfgHours(cfg.cfg_hours || "");
    setCfgMapLink(cfg.cfg_map_link || "");
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDeleteMessage = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus Pesan?",
      message: "Pesan yang dihapus tidak dapat dipulihkan."
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/kontak/messages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "Pesan dihapus", "Pesan berhasil dihapus.");
      fetchAll();
    } catch {
      showToast("error", "Gagal menghapus", "Terjadi kesalahan.");
    }
  };
  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/kontak/messages/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
      showToast("info", "Ditandai dibaca", "Pesan sudah ditandai dibaca.");
      fetchAll();
    } catch {
      showToast("error", "Gagal", "Tidak dapat menandai pesan.");
    }
  };

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cfg_address: cfgAddress, cfg_phone: cfgPhone, cfg_hours: cfgHours, cfg_map_link: cfgMapLink }) });
      if (!res.ok) throw new Error();
      showToast("success", "Konfigurasi disimpan", "Informasi kontak berhasil diperbarui.");
    } catch {
      showToast("error", "Gagal menyimpan", "Periksa koneksi dan coba lagi.");
    }
  };

  const handleOpenFaqAdd = () => { setFaqMode("create"); setFaqId(null); setFaqQuestion(""); setFaqAnswer(""); setIsFaqModalOpen(true); };
  const handleOpenFaqEdit = (f: FAQ) => { setFaqMode("edit"); setFaqId(f.id); setFaqQuestion(f.question); setFaqAnswer(f.answer); setIsFaqModalOpen(true); };
  const handleDeleteFaq = async (id: string) => {
    const isConfirmed = await confirm({
      title: "Hapus FAQ?",
      message: "Pertanyaan akan dihapus dari sistem."
    });
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/faq/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", "FAQ dihapus", "Pertanyaan berhasil dihapus.");
      fetchAll();
    } catch {
      showToast("error", "Gagal menghapus", "Terjadi kesalahan.");
    }
  };

  const handleFaqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { question: faqQuestion, answer: faqAnswer };
    try {
      let res;
      if (faqMode === "create") { res = await fetch("/api/faq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
      else { res = await fetch(`/api/faq/${faqId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); }
      if (!res.ok) throw new Error();
      showToast("success", faqMode === "create" ? "FAQ ditambahkan" : "FAQ diperbarui", "FAQ berhasil disimpan.");
      setIsFaqModalOpen(false);
      fetchAll();
    } catch {
      showToast("error", "Gagal menyimpan FAQ", "Periksa koneksi dan coba lagi.");
    }
  };

  if (loading) return <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span><p className="mt-2">Memuat...</p></div>;

  return (
    <div className="space-y-6 lg:space-y-8 pb-10">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-blue-100"><h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Pusat Bantuan & Kontak</h1><p className="text-blue-700 text-sm mt-1">Kelola perpesanan, kontak sekolah, dan FAQ publik.</p></div>

      <div className="bg-white border border-blue-100 rounded-[2rem] overflow-hidden shadow-sm flex flex-col h-full min-h-[500px]">
        <div className="flex border-b border-blue-100 bg-blue-50/50 flex-wrap">
          {(["Kotak Masuk", "Info Konfigurasi", "Kelola FAQ"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 px-2 text-center font-bold text-sm md:text-base border-b-2 transition-all ${activeTab === tab ? "border-blue-700 text-blue-700 bg-white" : "border-transparent text-blue-500 hover:text-blue-700 hover:bg-blue-50"}`}>{tab}</button>
          ))}
        </div>

        {activeTab === "Kotak Masuk" && (
          <div className="p-6 md:p-8 space-y-4 bg-gray-50/30">
            {messages.length === 0 ? <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined text-5xl opacity-40 mb-3">mark_email_read</span><p>Belum ada pesan baru.</p></div> : messages.map(msg => (
              <div key={msg.id} className={`p-6 rounded-2xl border transition-all ${msg.isRead ? "bg-white border-blue-100" : "bg-blue-50 border-blue-300 shadow-md"}`}>
                <div className="flex justify-between items-start gap-4 mb-4 border-b border-blue-100/50 pb-4">
                  <div><div className="flex items-center gap-2">{!msg.isRead && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}<h3 className="font-extrabold text-blue-950 text-lg">{msg.subject}</h3></div><p className="text-sm font-medium text-blue-800 mt-1">Dari: {msg.name} ({msg.email})</p></div>
                  <div className="text-xs font-bold text-blue-500 bg-white px-3 py-1 rounded-full border border-blue-100 whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString("id-ID")}</div>
                </div>
                <p className="text-blue-900 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                <div className="mt-6 flex gap-3">
                  {!msg.isRead && <button onClick={() => markAsRead(msg.id)} className="text-xs px-4 py-2 hover:bg-blue-100 font-bold text-blue-700 rounded-lg transition-colors border border-blue-200">Tandai Dibaca</button>}
                  <button onClick={() => handleDeleteMessage(msg.id)} className="text-xs px-4 py-2 hover:bg-red-50 text-red-600 font-bold rounded-lg transition-colors border border-red-100">Hapus Pesan</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Info Konfigurasi" && (
          <div className="p-6 md:p-8 max-w-3xl">
            <h2 className="text-xl font-extrabold text-blue-950 mb-6">Atur Informasi Kontak Kampus</h2>
            <form className="space-y-6" onSubmit={saveConfig}>
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Alamat Lengkap</label><textarea value={cfgAddress} onChange={e => setCfgAddress(e.target.value)} className="w-full px-6 py-4 rounded-xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950" rows={2} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Nomor Telepon</label><input type="text" value={cfgPhone} onChange={e => setCfgPhone(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950" /></div>
                <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Jam Operasional</label><input type="text" value={cfgHours} onChange={e => setCfgHours(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950" /></div>
              </div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700">Pin Google Maps</label><input type="text" value={cfgMapLink} onChange={e => setCfgMapLink(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-blue-950" /></div>
              <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-700/20 active:scale-95 transition-all">Simpan Konfigurasi</button>
            </form>
          </div>
        )}

        {activeTab === "Kelola FAQ" && (
          <div>
            <div className="p-4 border-b border-blue-50 flex justify-end"><button onClick={handleOpenFaqAdd} className="bg-blue-100 text-blue-700 px-6 py-2.5 rounded-full font-bold hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm"><span className="material-symbols-outlined text-[18px]">add</span> Tambah FAQ</button></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-white border-b border-blue-100 text-blue-400 uppercase tracking-widest text-[10px] font-bold"><th className="px-6 py-4 w-1/3">Pertanyaan</th><th className="px-6 py-4">Jawaban</th><th className="px-6 py-4 text-right w-32">Aksi</th></tr></thead>
                <tbody className="divide-y divide-blue-50">
                  {faqs.length === 0 ? <tr><td colSpan={3} className="py-12 text-center text-blue-400">Belum ada FAQ.</td></tr> : faqs.map(faq => (
                    <tr key={faq.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 align-top"><span className="font-bold text-blue-950 block">{faq.question}</span></td>
                      <td className="px-6 py-4 align-top"><span className="text-blue-800 text-sm">{faq.answer}</span></td>
                      <td className="px-6 py-4 text-right align-top space-x-2 whitespace-nowrap">
                        <button onClick={() => handleOpenFaqEdit(faq)} className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors border border-yellow-200 shadow-sm"><span className="material-symbols-outlined text-[18px] block">edit</span></button>
                        <button onClick={() => handleDeleteFaq(faq.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-200 shadow-sm"><span className="material-symbols-outlined text-[18px] block">delete</span></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isFaqModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm" onClick={() => setIsFaqModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-blue-100 flex justify-between items-center bg-blue-50/30"><h2 className="text-xl font-extrabold text-blue-950">{faqMode === "create" ? "Buat FAQ" : "Edit FAQ"}</h2></div>
            <form onSubmit={handleFaqSubmit} className="p-8 space-y-6">
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Pertanyaan</label><input type="text" value={faqQuestion} onChange={(e) => setFaqQuestion(e.target.value)} className="w-full px-6 py-4 rounded-full bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none" required /></div>
              <div className="space-y-2"><label className="text-xs font-bold uppercase tracking-wider text-blue-700 ml-4">Jawaban</label><textarea value={faqAnswer} onChange={(e) => setFaqAnswer(e.target.value)} className="w-full px-6 py-4 rounded-xl bg-blue-50/50 border border-blue-100 focus:bg-white focus:ring-4 focus:ring-blue-100 text-blue-950 transition-all outline-none resize-none" rows={4} required /></div>
              <div className="pt-4 flex justify-end gap-3 border-t border-blue-50">
                <button type="button" onClick={() => setIsFaqModalOpen(false)} className="px-6 py-3 rounded-full font-bold text-blue-600 hover:bg-blue-50 transition-colors">Batal</button>
                <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-700/25">Simpan FAQ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
