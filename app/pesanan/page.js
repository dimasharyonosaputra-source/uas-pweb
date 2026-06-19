"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PesananLogistik() {
  const [manifests, setManifests] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    fetch('/api/manifest', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) throw new Error('Sesi habis, silakan login kembali.');
      return res.json();
    })
    .then(data => {
      if (data.status === 'success') {
        setManifests(data.data);
      } else {
        setError(data.message || 'Gagal memuat data manifest.');
      }
    })
    .catch(err => setError(err.message));
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold tracking-wider text-blue-500">LOGISYS</h1>
          <div className="flex gap-4 text-sm font-medium">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition px-2 py-1">
              Manajemen Stok
            </button>
            <button className="text-blue-400 border-b-2 border-blue-500 px-2 py-1 font-semibold">
              Manifest Pengiriman
            </button>
            <button onClick={() => router.push('/log')} className="text-gray-400 hover:text-white transition px-2 py-1">
              Log Gudang
            </button>
          </div>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Keluar
        </button>
      </nav>

      {/* =========================================================
          UPGRADE: HERO BANNER IMAGE DENGAN KATA-KATA BESAR ALA LOGISLY
         ========================================================= */}
      <div 
        className="relative h-64 md:h-80 w-full bg-cover bg-center flex items-center justify-center border-b border-gray-800"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.4), rgba(3, 7, 18, 0.95)), url('https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop')` 
        }}
      >
        <div className="text-center px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Distribusi Lancar, <span className="text-blue-500">Logistik Terintegrasi</span>
          </h2>
          <p className="text-gray-300 text-sm md:text-base mt-2 max-w-xl mx-auto font-medium">
            Sistem monitoring jaringan distribusi kontainer dan manifest armada truk LOGISYS secara real-time di seluruh Indonesia.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-mono font-semibold text-blue-400">
            🚚 Total Jalur Distribusi Aktif Terkoneksi
          </div>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto -mt-6 relative z-10">
        
        {/* DETAIL NAVIGASI INFORMASI */}
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-2 bg-gray-900/60 backdrop-blur border border-gray-800/80 p-4 rounded-xl shadow-lg">
          <div>
            <h3 className="text-lg font-bold text-white">Monitoring Jaringan Pengiriman</h3>
            <p className="text-gray-400 text-xs mt-0.5">Daftar distribusi komponen yang sedang berjalan terpantau dari database MySQL.</p>
          </div>
          <div className="text-xs font-mono text-gray-500">
            Status Koneksi: <span className="text-green-400 font-medium">Live Feed</span>
          </div>
        </div>

        {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-sm">{error}</div>}

        {/* TABEL MANIFEST NYATA */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/40 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                <th className="p-4">No Resi / Manifest</th>
                <th className="p-4">Muatan Komponen</th>
                <th className="p-4">Jenis Armada</th>
                <th className="p-4">Kota Tujuan</th>
                <th className="p-4 text-center">Status Distribusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {manifests.length > 0 ? (
                manifests.map((order, index) => (
                  <tr key={order.id_manifest || index} className="hover:bg-gray-800/20 transition">
                    <td className="p-4 font-mono text-blue-400 font-semibold">{order.resi}</td>
                    <td className="p-4 font-medium text-white">{order.komponen}</td>
                    <td className="p-4 text-gray-300">{order.armada}</td>
                    <td className="p-4 text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {order.tujuan}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        order.status_distribusi === 'Delivered' ? 'bg-green-950 text-green-400 border-green-800' : 
                        order.status_distribusi === 'On Process' ? 'bg-blue-950 text-blue-400 border-blue-800' : 
                        'bg-yellow-950 text-yellow-400 border-yellow-800'
                      }`}>
                        {order.status_distribusi}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Belum ada data manifest pengiriman di database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-auto px-8 py-10 text-sm text-gray-400">
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <h3 className="text-white font-bold tracking-wider text-base"><span className="text-blue-500">LOGISYS</span> SYSTEM</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Platform internal integrasi manajemen inventaris komponen logistik dan monitoring distribusi armada truk terpadu di Indonesia.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-gray-300">Hubungi Operational</h4>
            <p className="text-xs">📞 +62 812-3456-7890 (Gudang Utama)</p>
            <p className="text-xs">✉️ support@logisys-system.com</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-gray-300">Lokasi Terminal & Hub</h4>
            <p className="text-xs font-medium text-gray-300">Hub Pekanbaru:</p>
            <p className="text-xs text-gray-500">Jl. Sudirman No. 45, Pekanbaru, Riau</p>
          </div>
        </div>
        <div className="max-w-6xl w-full mx-auto border-t border-gray-800/60 mt-8 pt-4 text-center text-xs text-gray-600 flex flex-col md:flex-row justify-between">
          <span>&copy; 2026 LOGISYS System. Hak Cipta Dilindungi Undang-Undang.</span>
          <span className="text-blue-900">Teknik Informatika | UAS Pemrograman Web</span>
        </div>
      </footer>
    </div>
  );
}