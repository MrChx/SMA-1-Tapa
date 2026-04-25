"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

export default function AdminDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [counts, setCounts] = useState({ organisasi: 0, direktori: 0, galeri: 0, messages: 0, faq: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/organisasi").then(r => r.json()),
      fetch("/api/direktori").then(r => r.json()),
      fetch("/api/galeri").then(r => r.json()),
      fetch("/api/kontak/messages").then(r => r.json()),
      fetch("/api/faq").then(r => r.json()),
    ]).then(([org, dir, gal, msg, faq]) => {
      setCounts({ organisasi: org.length, direktori: dir.length, galeri: gal.length, messages: msg.filter((m: { isRead: boolean }) => !m.isRead).length, faq: faq.length });
      setLoading(false);
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    showToast("info", "Sesi berakhir", "Anda telah berhasil keluar.");
    router.push("/login");
  };

  const cards = [
    { label: "Anggota Organisasi", value: counts.organisasi, icon: "account_tree", color: "bg-blue-700" },
    { label: "Data Direktori", value: counts.direktori, icon: "groups", color: "bg-blue-600" },
    { label: "Kegiatan Galeri", value: counts.galeri, icon: "gallery_thumbnail", color: "bg-blue-500" },
    { label: "Pesan Belum Dibaca", value: counts.messages, icon: "mark_email_unread", color: "bg-yellow-500" },
    { label: "FAQ Publik", value: counts.faq, icon: "quiz", color: "bg-blue-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-950 tracking-tight">Dashboard Admin</h1>
          <p className="text-blue-700 text-sm mt-1">Ringkasan data dan pengelolaan SMA Negeri 1 Tapa.</p>
        </div>
        <button onClick={handleLogout} className="bg-red-50 text-red-600 border border-red-200 px-6 py-2.5 rounded-full font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-sm shadow-sm">
          <span className="material-symbols-outlined text-[18px]">logout</span> Keluar
        </button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-blue-400"><span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span><p className="mt-2 text-sm">Memuat ringkasan...</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-[2rem] p-8 border border-blue-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
              <div className={`${card.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="material-symbols-outlined text-white text-3xl">{card.icon}</span>
              </div>
              <div>
                <p className="text-3xl font-black text-blue-950">{card.value}</p>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
