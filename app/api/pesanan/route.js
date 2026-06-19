import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

// 9. GET: Menampilkan semua daftar pesanan
export async function GET(request) {
  try {
    // --- GEMBOK KEAMANAN (SAMA DI SEMUA FUNGSI) ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });
    // ----------------------------------------------
    const [rows] = await db.query('SELECT * FROM pesanan');
    return NextResponse.json({ status: 'success', data: rows });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

// 10. POST: Membuat transaksi/pesanan baru
export async function POST(request) {
  try {
    // --- GEMBOK KEAMANAN ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });

    // CEK ROLE AUTORISASI: Tolak kalau bukan admin
    if (users[0].role !== 'admin') {
      return NextResponse.json({ status: 'error', message: 'Hanya Admin yang boleh menambah data!' }, { status: 403 });
    }
    // ----------------------------------------------
    const body = await request.json();
    const { no_invoice, id_pelanggan, tanggal_pesan, status_pesanan } = body;
    await db.query(
      'INSERT INTO pesanan (no_invoice, id_pelanggan, tanggal_pesan, status_pesanan) VALUES (?, ?, ?, ?)',
      [no_invoice, id_pelanggan, tanggal_pesan, status_pesanan]
    );
    return NextResponse.json({ status: 'success', message: 'Pesanan berhasil dibuat!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

// 11. PUT: Mengubah status pesanan
export async function PUT(request) {
  try {
    // --- GEMBOK KEAMANAN ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });

    if (users[0].role !== 'admin') return NextResponse.json({ status: 'error', message: 'Hanya Admin yang boleh edit!' }, { status: 403 });
    // ----------------------------------------------
    const body = await request.json();
    const { no_invoice, status_pesanan } = body;
    await db.query('UPDATE pesanan SET status_pesanan=? WHERE no_invoice=?', [status_pesanan, no_invoice]);
    return NextResponse.json({ status: 'success', message: 'Status pesanan berhasil diperbarui!' });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

// 12. DELETE: Membatalkan/Menghapus transaksi pesanan
export async function DELETE(request) {
  try {
    // --- GEMBOK KEAMANAN ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });

    if (users[0].role !== 'admin') return NextResponse.json({ status: 'error', message: 'Hanya Admin yang boleh hapus!' }, { status: 403 });
    // ----------------------------------------------
    const { searchParams } = new URL(request.url);
    const invoice = searchParams.get('invoice');
    await db.query('DELETE FROM pesanan WHERE no_invoice=?', [invoice]);
    return NextResponse.json({ status: 'success', message: 'Pesanan berhasil dihapus!' });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}