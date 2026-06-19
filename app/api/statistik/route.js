import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

// 15. GET: Menampilkan statistik performa penjualan barang
export async function GET() {
  try {
    // 1. Hitung total uang yang masuk dari tabel pembayaran
    const [pembayaran] = await db.query('SELECT SUM(jumlah_bayar) as total_omset FROM pembayaran');
    
    // 2. Hitung total transaksi invoice yang tercipta
    const [pesanan] = await db.query('SELECT COUNT(*) as total_transaksi FROM pesanan');
    
    // 3. Hitung jumlah item produk unik di gudang/toko
    const [produk] = await db.query('SELECT COUNT(*) as total_ragam_produk FROM produk');

    return NextResponse.json({
      status: 'success',
      data: {
        total_pendapatan: pembayaran[0].total_omset || 0,
        jumlah_transaksi: pesanan[0].total_transaksi,
        ragam_produk_tersedia: produk[0].total_ragam_produk
      }
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: String(error) }, { status: 500 });
  }
}