import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET(request) {
  try {
    // Gembok Keamanan Token Akses
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ status: 'error', message: 'Akses Ditolak!' }, { status: 401 });
    
    const token = authHeader.split(' ')[1]; 
    const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
    if (users.length === 0) return NextResponse.json({ status: 'error', message: 'Token tidak valid.' }, { status: 401 });

    // Ambil data log asli dari database MySQL, urutkan dari yang paling baru (DESC)
    const [rows] = await db.query('SELECT * FROM log_gudang ORDER BY id_log DESC');
    return NextResponse.json({ status: 'success', data: rows });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}