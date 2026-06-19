import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

// 5. GET: Menampilkan semua pelanggan
export async function GET(request) {
  try {
    // --- GEMBOK KEAMANAN (SAMA DI SEMUA FUNGSI) ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak! Belum login.' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });
    // ----------------------------------------------
    const [rows] = await db.query('SELECT * FROM pelanggan');
    return NextResponse.json({ status: 'success', data: rows });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

// 6. POST: Menambah pelanggan baru
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
    const { nama_pelanggan, alamat, no_telp } = body;
    const [result] = await db.query(
      'INSERT INTO pelanggan (nama_pelanggan, alamat, no_telp) VALUES (?, ?, ?)',
      [nama_pelanggan, alamat, no_telp]
    );
    return NextResponse.json({ status: 'success', message: 'Pelanggan berhasil ditambahkan!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

// 7. PUT: Mengedit data pelanggan
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
    const { id_pelanggan, nama_pelanggan, alamat, no_telp } = body;
    await db.query(
      'UPDATE pelanggan SET nama_pelanggan=?, alamat=?, no_telp=? WHERE id_pelanggan=?',
      [nama_pelanggan, alamat, no_telp, id_pelanggan]
    );
    return NextResponse.json({ status: 'success', message: 'Data pelanggan berhasil diupdate!' });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}

// 8. DELETE: Menghapus pelanggan
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
    const id = searchParams.get('id');
    await db.query('DELETE FROM pelanggan WHERE id_pelanggan=?', [id]);
    return NextResponse.json({ status: 'success', message: 'Pelanggan berhasil dihapus!' });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}