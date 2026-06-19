"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogGudang() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    fetch('/api/log', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) throw new Error('Sesi habis, silakan login kembali.');
      return res.json();
    })
    .then(data => {
      if (data.status === 'success') setLogs(data.data);
      else setError(data.message || 'Gagal memuat data log.');
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
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition px-2 py-1">Manajemen Stok</button>
            <button onClick={() => router.push('/pesanan')} className="text-gray-400 hover:text-white transition px-2 py-1">Manifest Pengiriman</button>
            <button className="text-blue-400 border-b-2 border-blue-500 px-2 py-1 font-semibold">Log Gudang</button>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Keluar</button>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Audit Log Aktivitas Gudang</h2>
          <p className="text-gray-400 text-sm mt-1">Catatan riwayat masuk dan keluarnya stok logistik yang diproses secara langsung oleh operator dari database MySQL.</p>
        </div>

        {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-sm">{error}</div>}

        {/* TABEL AUDIT LOG ASLI */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/40 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                <th className="p-4">Waktu Kejadian</th>
                <th className="p-4">Komponen Logistik</th>
                <th className="p-4">Tipe Aksi</th>
                <th className="p-4">Jumlah Perubahan</th>
                <th className="p-4">Operator Bertugas</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr key={log.id_log || index} className="hover:bg-gray-800/20 transition">
                    <td className="p-4 text-gray-400 font-mono text-xs flex items-center gap-1.5">
                      <span>🕒</span>
                      {new Date(log.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-semibold text-white">{log.komponen}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${log.tipe === 'Barang Masuk' ? 'text-green-400 bg-green-950/50 border-green-800' : log.tipe === 'Ubah Data' ? 'text-yellow-400 bg-yellow-950/50 border-yellow-800' : 'text-red-400 bg-red-950/50 border-red-800'}`}>
                        {log.tipe}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-gray-200">{log.jumlah}</td>
                    <td className="p-4 text-gray-300">{log.operator}</td>
                    <td className="p-4 text-center">
                      <span className="text-green-400 font-medium flex items-center justify-center gap-1">
                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span>
                        Sukses
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Belum ada rekaman log di database MySQL.</td></tr>
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
            <p className="text-xs">?? +62 812-3456-7890 (Gudang Utama)</p>
            <p className="text-xs">?? support@logisys-system.com</p>
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