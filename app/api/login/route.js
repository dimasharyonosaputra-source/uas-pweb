import { NextResponse } from 'next/server';
import { db } from '../../../lib/db'; // Pastikan path ini sama dengan file route.js yang lain

export const dynamic = 'force-dynamic';
console.log("Pancingan update Vercel");

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 1. Cek apakah username dan password cocok di database
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    // Jika tidak ada yang cocok, tolak aksesnya (Error 401 Unauthorized)
    if (users.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Username atau Password salah!' }, 
        { status: 401 }
      );
    }

    const user = users[0];

    // 2. Jika cocok, buatkan Token Karcis Masuk
    // Kita buat kode acak sederhana gabungan huruf, angka, dan waktu
    const token = 'TUGAS8-' + Math.random().toString(36).substring(2) + '-' + Date.now();

    // 3. Simpan token tersebut ke database tabel users
    await db.query(
      'UPDATE users SET token = ? WHERE id_user = ?',
      [token, user.id_user]
    );

    // 4. Berikan tokennya sebagai kembalian (Response)
    return NextResponse.json({ 
      status: 'success', 
      message: 'Login berhasil!',
      data: {
        username: user.username,
        role: user.role,
        token: token
      }
    });

  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}