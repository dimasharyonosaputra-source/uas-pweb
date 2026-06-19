"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [produk, setProduk] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  // STATE PENCARIAN & PAGINATION
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // STATE MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('tambah');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idProdukTargetHapus, setIdProdukTargetHapus] = useState('');

  // STATE INPUT
  const [idProduk, setIdProduk] = useState('');
  const [namaProduk, setNamaProduk] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');

  // STATE STATISTIK & KOSMETIK
  const [statistis, setStatistik] = useState({ totalBarang: 0, totalAset: 0, stokMenipis: 0 });
  const [waktuUpdate, setWaktuUpdate] = useState('');

  useEffect(() => { 
    muatDataBarang();
    setWaktuUpdate(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  useEffect(() => {
    if (produk.length > 0) {
      const totalBarang = produk.length;
      const totalAset = produk.reduce((acc, curr) => acc + (Number(curr.harga) * Number(curr.stok)), 0);
      const stokMenipis = produk.filter(item => Number(item.stok) <= 10).length;
      setStatistik({ totalBarang, totalAset, stokMenipis });
    }
  }, [produk]);

  const muatDataBarang = () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    fetch('/api/produk', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) throw new Error('Sesi habis, silakan login kembali.');
      return res.json();
    })
    .then(data => {
      if (data.status === 'success') {
        setProduk(data.data);
        setWaktuUpdate(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
      }
      else setError(data.message || 'Gagal memuat data.');
    })
    .catch(err => setError(err.message));
  };

  const handleSimpanData = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = modalMode === 'tambah' ? 'POST' : 'PUT';
    const payload = modalMode === 'tambah' 
      ? { nama_produk: namaProduk, harga: Number(harga), stok: Number(stok) }
      : { id_produk: idProduk, nama_produk: namaProduk, harga: Number(harga), stok: Number(stok) };

    fetch('/api/produk', {
      method: method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') { setIsModalOpen(false); muatDataBarang(); }
      else alert(data.message);
    })
    .catch(err => alert(err.message));
  };

  const handleEkskusiHapus = () => {
    const token = localStorage.getItem('token');
    fetch(`/api/produk?id=${idProdukTargetHapus}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') { 
        setIsDeleteModalOpen(false); 
        if (currentItems.length === 1 && currentPage > 1) { setCurrentPage(currentPage - 1); }
        muatDataBarang(); 
      }
      else alert(data.message);
    })
    .catch(err => alert(err.message));
  };

  // LOGIKA FILTER PENCARIAN
  const produkTerfilter = produk.filter(item => 
    item.nama_produk.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // LOGIKA PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = produkTerfilter.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(produkTerfilter.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold tracking-wider text-blue-500">LOGISYS</h1>
          <div className="flex gap-4 text-sm font-medium">
            <button className="text-blue-400 border-b-2 border-blue-500 px-2 py-1 font-semibold">Manajemen Stok</button>
            <button onClick={() => router.push('/pesanan')} className="text-gray-400 hover:text-white transition px-2 py-1">Manifest Pengiriman</button>
            <button onClick={() => router.push('/log')} className="text-gray-400 hover:text-white transition px-2 py-1">Log Gudang</button>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); router.push('/login'); }} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-red-900/20">
          Keluar Sistem
        </button>
      </nav>

      {/* =========================================================
          UPGRADE: HERO BANNER IMAGE UNTUK MANAJEMEN STOK GUDANG
         ========================================================= */}
      <div 
        className="relative h-64 md:h-72 w-full bg-cover bg-center flex items-center justify-center border-b border-gray-800"
        style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(3, 7, 18, 0.5), rgba(3, 7, 18, 0.95)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop')` 
        }}
      >
        <div className="text-center px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
            Satu Sistem untuk <span className="text-blue-500">Kebutuhan Stok Anda</span>
          </h2>
          <p className="text-gray-300 text-sm md:text-base mt-2 max-w-xl mx-auto font-medium">
            Kendali penuh manajemen penyimpanan, nominal nilai aset, dan audit restock inventaris gudang LOGISYS secara akurat.
          </p>
        </div>
      </div>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto -mt-10 relative z-10">
        
        {/* INDIKATOR STATUS SISTEM AKTIF */}
        <div className="flex items-center justify-between mb-4 bg-gray-900/80 backdrop-blur border border-gray-800/60 px-4 py-2 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
            <span className="text-green-400 font-medium">Server Online</span>
            <span>•</span>
            <span>Operator: <span className="text-gray-300">Dimas H. (Admin)</span></span>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Terakhir Sinkron: <span className="text-blue-400">{waktuUpdate} WIB</span>
          </div>
        </div>

        {/* CONTROLS AREA */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Daftar Inventaris Komponen</h3>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 text-xs">🔍</span>
              <input 
                type="text" 
                placeholder="Cari nama komponen..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white w-44 sm:w-48 focus:outline-none focus:border-blue-500 transition placeholder-gray-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-white text-xs">&times;</button>
              )}
            </div>
            <button onClick={() => { setModalMode('tambah'); setIdProduk(''); setNamaProduk(''); setHarga(''); setStok(''); setIsModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition flex items-center gap-2 shadow-lg shadow-blue-900/30 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Tambah Produk
            </button>
          </div>
        </div>

        {error && <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-lg mb-6 text-sm">{error}</div>}

        {/* METRIK KARTU */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-800/80 p-5 rounded-xl flex flex-col justify-between shadow-md">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Variasi Komponen</span>
            <span className="text-3xl font-bold text-white mt-2">{statistis.totalBarang} <span className="text-sm font-normal text-gray-500">Item</span></span>
          </div>
          <div className="bg-gray-900 border border-gray-800/80 p-5 rounded-xl flex flex-col justify-between shadow-md">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Estimasi Nilai Aset</span>
            <span className="text-3xl font-bold text-blue-400 mt-2">Rp {statistis.totalAset.toLocaleString('id-ID')}</span>
          </div>
          <div className="bg-gray-900 border border-gray-800/80 p-5 rounded-xl flex flex-col justify-between shadow-md">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Perlu Restock (Stok &le; 10)</span>
            <span className={`text-3xl font-bold mt-2 ${statistis.stokMenipis > 0 ? 'text-yellow-500 animate-pulse' : 'text-green-400'}`}>
              {statistis.stokMenipis} <span className="text-sm font-normal text-gray-500">Item</span>
            </span>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="bg-gray-900 border border-gray-800/80 rounded-xl overflow-hidden shadow-2xl mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800/60 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 text-center w-16">No</th>
                <th className="p-4">Nama Produk / Barang</th>
                <th className="p-4 w-44">Harga</th>
                <th className="p-4 w-32">Stok</th>
                <th className="p-4 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id_produk || index} className="hover:bg-gray-800/30 transition duration-150">
                    <td className="p-4 text-center text-gray-500 font-medium">{indexOfFirstItem + index + 1}</td>
                    <td className="p-4 font-semibold text-gray-100">{item.nama_produk}</td>
                    <td className="p-4 text-blue-400 font-medium">Rp {Number(item.harga).toLocaleString('id-ID')}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block border ${item.stok > 10 ? 'bg-green-950/40 text-green-400 border-green-800/30' : 'bg-yellow-950/40 text-yellow-500 border-yellow-800/30'}`}>
                        {item.stok} unit
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setModalMode('edit'); setIdProduk(item.id_produk); setNamaProduk(item.nama_produk); setHarga(item.harga); setStok(item.stok); setIsModalOpen(true); }} className="bg-gray-800/80 hover:bg-gray-700 text-yellow-400 p-2 rounded-lg transition border border-gray-700/60">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => { setIdProdukTargetHapus(item.id_produk); setIsDeleteModalOpen(true); }} className="bg-gray-800/80 hover:bg-red-950/40 hover:text-red-400 p-2 rounded-lg transition border border-gray-700/60 hover:border-red-900/50">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Tidak ada komponen logistik yang cocok dengan pencarian.</td></tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="bg-gray-900/90 border-t border-gray-800 px-6 py-4 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                Menampilkan <span className="text-white font-semibold">{indexOfFirstItem + 1}</span> - <span className="text-white font-semibold">{Math.min(indexOfLastItem, produkTerfilter.length)}</span> dari <span className="text-white font-semibold">{produkTerfilter.length}</span> komponen
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${currentPage === 1 ? 'bg-gray-950 text-gray-600 border-gray-800/60 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'}`}>Sebelumnya</button>
                <div className="flex items-center px-2 text-xs font-mono font-bold text-blue-400 bg-gray-950 border border-gray-800 rounded-lg">Hal {currentPage} / {totalPages}</div>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${currentPage === totalPages ? 'bg-gray-950 text-gray-600 border-gray-800/60 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'}`}>Selanjutnya</button>
              </div>
            </div>
          )}
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

      {/* MODAL INSERTS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-gray-800/50 px-6 py-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">{modalMode === 'tambah' ? 'Tambah Komponen Logistik' : 'Ubah Data Komponen'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSimpanData} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Nama Komponen / Produk</label>
                <input type="text" required value={namaProduk} onChange={(e) => setNamaProduk(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Harga (Rp)</label>
                  <input type="number" required value={harga} onChange={(e) => setHarga(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Jumlah Stok</label>
                  <input type="number" required value={stok} onChange={(e) => setStok(e.target.value)} className="w-full bg-gray-950 border border-gray-800 p-3 rounded-lg text-white focus:outline-none focus:border-blue-500 transition" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-lg text-sm transition">Batal</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-red-900/30 rounded-xl max-w-sm w-full overflow-hidden shadow-2xl border-t-4 border-t-red-600">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-950/50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Konfirmasi Hapus</h3>
              <p className="text-gray-400 text-sm">Apakah Anda yakin ingin menghapus komponen logistik ini? Tindakan ini akan dicatat langsung pada audit log.</p>
            </div>
            <div className="bg-gray-950/60 px-6 py-4 flex justify-end gap-3 border-t border-gray-800/80">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition">Batal</button>
              <button type="button" onClick={handleEkskusiHapus} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-red-900/20">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}