import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

// 13. GET: Menampilkan riwayat pembayaran
export async function GET(request) {
  try {
    // --- GEMBOK KEAMANAN (SAMA DI SEMUA FUNGSI) ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });
    // ----------------------------------------------
    const [rows] = await db.query('SELECT * FROM pembayaran');
    return NextResponse.json({ status: 'success', data: rows });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}
// 14. POST: Mencatat pembayaran baru masuk
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
    // Pastikan di sini pakai jumlah_bayar
    const { no_invoice, metode_bayar, jumlah_bayar, tanggal_bayar } = body;
    
    // Pastikan di query SQL juga pakai jumlah_bayar
    await db.query(
      'INSERT INTO pembayaran (no_invoice, metode_bayar, jumlah_bayar, tanggal_bayar) VALUES (?, ?, ?, ?)',
      [no_invoice, metode_bayar, jumlah_bayar, tanggal_bayar]
    );
    
    return NextResponse.json({ status: 'success', message: 'Pembayaran berhasil dicatat!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}