import Image from "next/image";
import Link from "next/link";

export default function DirektoriIndex() {
  const categories = [
    { slug: "guru", name: "Guru & Staf", sub: "Tenaga Pendidik & Kependidikan", icon: "school", color: "from-blue-600 to-blue-400" },
    { slug: "siswa", name: "Siswa", sub: "Duta Sekolah", icon: "groups", color: "from-blue-500 to-cyan-400" },
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/direktori/${cat.slug}`}
              className="group bg-white rounded-[2rem] border border-blue-100 p-10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center"
            >
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <span className="material-symbols-outlined text-white text-3xl">{cat.icon}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-blue-950 mb-2 group-hover:text-blue-700 transition-colors">{cat.name}</h2>
              <p className="text-blue-700 text-sm mb-6">{cat.sub}</p>
              <span className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-blue-700/20 group-hover:bg-blue-800 transition-all">
                Lihat Direktori <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-blue-50 rounded-t-[2rem] md:rounded-t-[3rem] w-full mt-12 md:mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="flex items-center gap-3"><Image src="/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" /><div className="text-xl font-extrabold text-blue-700">SMA N 1 Tapa</div></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 pb-8"><div className="pt-8 border-t border-blue-200 text-center"><div className="text-blue-700 text-xs">© {new Date().getFullYear()} SMA Negeri 1 Tapa.</div></div></div>
      </footer>
    </>
  );
}
