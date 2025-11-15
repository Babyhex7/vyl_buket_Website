"use client";
import Link from 'next/link';
import NavBar from '../../../components/ui/NavBar';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('order_id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderIdParam) {
      setLoading(false);
      setError('Order ID tidak diberikan');
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        // If orderIdParam looks like a number, try /api/orders/:id, otherwise try query by order_number
        let url = '';
        if (/^\d+$/.test(orderIdParam)) {
          url = `/api/orders/${orderIdParam}`;
        } else {
          url = `/api/orders?order_number=${encodeURIComponent(orderIdParam)}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gagal mengambil order');

        // The API may return the order directly or inside data.data — normalize
        let result = data.data || data;

        // If API returns an array or wrapper, try to extract first object
        if (Array.isArray(result) && result.length > 0) result = result[0];

        // If we didn't get a usable result from the API, fall back to localStorage
        if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) {
          // DUMMY FALLBACK: try to read the last submitted order from localStorage.
          // This is temporary so the UI can show the submitted data while the real
          // backend API isn't available. Replace this fallback with real API logic.
          try {
            const raw = localStorage.getItem('lastOrder');
            if (raw) {
              const local = JSON.parse(raw);
              setOrder(local);
              return;
            }
          } catch (err) {
            console.warn('Error reading lastOrder from localStorage', err);
          }

          throw new Error('Tidak ada data order dari API dan tidak ada data lokal');
        }

        setOrder(result);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderIdParam]);

  const formatPrice = (price) => {
    if (price == null) return 'Rp ...';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="min-h-screen bg-amber-50 pb-12">
      <div className="relative z-20">
        <NavBar />
      </div>

      <main className="max-w-3xl mx-auto px-4 pt-28">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Pesanan Berhasil!</h1>
          <p className="text-amber-700 mb-6">Pesanan Anda telah kami terima dan sedang diproses</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Memuat detail pesanan...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            <section className="bg-white rounded-xl shadow p-6 border border-pink-50 mb-6">
              <h2 className="font-semibold mb-4">Detail Pesanan</h2>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">ID Pesanan</div>
                  <div className="font-medium">{order.order_number || order.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Tanggal Order</div>
                  <div className="font-medium">{new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>

                <div className="col-span-2 border-t pt-4">
                  <div className="text-xs text-gray-500">Nama Pembeli</div>
                  <div className="font-medium">{order.customer_name || order.name || '-'}</div>
                </div>

                <div className="col-span-2 mt-3">
                  <div className="text-xs text-gray-500">Buket yang Dipesan</div>
                  <div className="font-semibold">{order.bouquet_name || order.bouquet?.name || '-'}</div>
                </div>

                <div className="col-span-1 mt-3">
                  <div className="text-xs text-gray-500">Tanggal Ambil</div>
                  <div className="font-medium">{order.pickup_date || order.pickupDate || '-'}</div>
                </div>
                <div className="col-span-1 mt-3">
                  <div className="text-xs text-gray-500">Jam Ambil</div>
                  <div className="font-medium">{order.pickup_time || order.pickupTime || '-'}</div>
                </div>

                <div className="col-span-2 mt-3">
                  <div className="text-xs text-gray-500">Pesan Kartu Ucapan</div>
                  <div className="italic text-gray-600">{order.card_message || order.message || '-'}</div>
                </div>
              </div>

              <div className="mt-4 bg-pink-50 border-t border-pink-100 rounded-b-md p-4">
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span>Total Harga:</span>
                  <span className="font-semibold">{formatPrice(order.total_price || order.bouquet_price || order.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 mb-1">
                  <span>Dibayar:</span>
                  <span className="font-semibold">{formatPrice(order.total_paid || order.paid || 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-rose-500">
                  <span>Sisa:</span>
                  <span className="font-semibold">{formatPrice((order.total_price || order.bouquet_price || order.total || 0) - (order.total_paid || order.paid || 0))}</span>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow p-6 border border-pink-50 mb-6">
              <h3 className="font-semibold mb-3">Langkah Selanjutnya</h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 font-semibold">1</div>
                  <div>Admin akan memeriksa bukti transfer Anda</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 font-semibold">2</div>
                  <div>Anda akan menerima konfirmasi melalui WhatsApp</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 font-semibold">3</div>
                  <div>Buket akan diproses sesuai jadwal pengambilan</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 font-semibold">4</div>
                  <div>Ambil buket sesuai tanggal dan waktu yang dipilih</div>
                </li>
              </ol>
            </section>

            <div className="flex gap-4">
              <a href={`https://wa.me/${order.sender_phone || ''}`} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.478A11.916 11.916 0 0012 .5C5.649.5.999 5.149.999 11.5c0 2.026.546 3.91 1.583 5.568L.5 23.5l6.662-1.74A11.937 11.937 0 0012 23.5c6.351 0 11.001-4.649 11.001-11.001 0-3.087-1.205-5.91-2.481-7.021z"/></svg>
                Hubungi via WhatsApp
              </a>

              <Link href="/" className="flex-1 inline-flex items-center justify-center gap-2 border border-pink-300 text-pink-500 font-semibold py-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
                Kembali ke Beranda
              </Link>
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">♡ Terima kasih telah mempercayai vyl.bouquet</p>
          </>
        )}
      </main>
    </div>
  );
}
