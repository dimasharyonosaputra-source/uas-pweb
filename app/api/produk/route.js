import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

// ==========================================
// 1. GET: Tampil Produk (Semua Boleh Akses)
// ==========================================
export async function GET(request) {
  try {
    // --- GEMBOK KEAMANAN ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });

    // Ambil semua data produk
    const [rows] = await db.query('SELECT * FROM produk');
    return NextResponse.json({ status: 'success', data: rows });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

// ==========================================
// 2. POST: Tambah Produk & Catat Log (Admin)
// ==========================================
export async function POST(request) {
  try {
    // --- GEMBOK KEAMANAN ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });

    if (users[0].role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Hanya Admin yang boleh menambah data!' }, { status: 403 });
    }

    // --- PROSES SIMPAN DATA & LOG ---
    const body = await request.json();
    const { nama_produk, harga, stok } = body;
    
    // 1. Simpan ke tabel produk
    await db.query(
      'INSERT INTO produk (nama_produk, harga, stok) VALUES (?, ?, ?)',
      [nama_produk, harga, stok]
    );

    // 2. Otomatis rekam ke tabel log_gudang
    await db.query(
      'INSERT INTO log_gudang (komponen, tipe, jumlah, operator) VALUES (?, ?, ?, ?)',
      [nama_produk, 'Barang Masuk', `${stok} Unit`, 'Mulyono.']
    );

    return NextResponse.json({ status: 'success', message: 'Produk dan Log berhasil dicatat!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

// ==========================================
// 3. PUT: Edit Produk & Catat Log (Admin)
// ==========================================
export async function PUT(request) {
  try {
    // --- GEMBOK KEAMANAN ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });

    if (users[0].role !== 'admin') return NextResponse.json({ status: 'error', message: 'Hanya Admin yang boleh edit!' }, { status: 403 });

    // --- PROSES UPDATE DATA & LOG ---
    const body = await request.json();
    const { id_produk, nama_produk, harga, stok } = body;
    
    // Update data produk lama
    await db.query(
      'UPDATE produk SET nama_produk=?, harga=?, stok=? WHERE id_produk=?',
      [nama_produk, harga, stok, id_produk]
    );

    // Catat ke log gudang bahwa komponen ini diperbarui informasinya
    await db.query(
      'INSERT INTO log_gudang (komponen, tipe, jumlah, operator) VALUES (?, ?, ?, ?)',
      [nama_produk, 'Ubah Data', ` ${stok} Unit`, 'Mulyono.']
    );

    return NextResponse.json({ status: 'success', message: 'Produk dan Log update berhasil disimpan!' });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

// ==========================================
// 4. DELETE: Hapus Produk & Catat Log (Admin)
// ==========================================
export async function DELETE(request) {
  try {
    // --- GEMBOK KEAMANAN ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });

    if (users[0].role !== 'admin') return NextResponse.json({ status: 'error', message: 'Hanya Admin yang boleh hapus!' }, { status: 403 });

    // --- PROSES HAPUS DATA & LOG ---
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Ambil nama produk dulu sebelum dihapus untuk keperluan log audit
    const [produkLama] = await db.query('SELECT nama_produk FROM produk WHERE id_produk = ?', [id]);
    const namaKomponenTerhapus = produkLama.length > 0 ? produkLama[0].nama_produk : 'Komponen Terhapus';

    // Hapus dari tabel produk
    await db.query('DELETE FROM produk WHERE id_produk=?', [id]);

    // Masukkan ke log gudang dengan tipe Barang Keluar/Dihapus
    await db.query(
      'INSERT INTO log_gudang (komponen, tipe, jumlah, operator) VALUES (?, ?, ?, ?)',
      [namaKomponenTerhapus, 'Barang Keluar', 'Dihapus', 'Mulyono.']
    );

    return NextResponse.json({ status: 'success', message: 'Produk berhasil dihapus dan tercatat di Log!' });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}