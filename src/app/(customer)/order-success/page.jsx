"use client";

import Link from 'next/link';
import NavBar from '../../../components/ui/NavBar';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('order_id');
  const orderNumberParam = searchParams.get('order_number');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      setUsedFallback(false);

      // Determine identifier preference: order_number (query) -> order_id (query) -> lastOrderId -> lastOrder.order_number
      let identifier = orderNumberParam || orderIdParam || null;

      try {
        if (!identifier) {
          try {
            const savedId = localStorage.getItem('lastOrderId');
            if (savedId) identifier = savedId;
          } catch (err) {
            console.warn('Could not read lastOrderId', err);
          }
        }

        if (!identifier) {
          try {
            const raw = localStorage.getItem('lastOrder');
            if (raw) {
              const local = JSON.parse(raw);
              if (local?.order_number) identifier = local.order_number;
            }
          } catch (err) {
            console.warn('Could not read lastOrder', err);
          }
        }

        if (!identifier) {
          setError('Nomor order tidak ditemukan.');
          setLoading(false);
          return;
        }

        // Build API URL
        let url = '';
        if (/^\d+$/.test(identifier)) {
          url = `/api/orders/${identifier}`;
        } else {
          url = `/api/orders?order_number=${encodeURIComponent(identifier)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (res.ok) {
          let result = data.data || data;
          if (Array.isArray(result) && result.length > 0) result = result[0];
          if (result && Object.keys(result).length > 0) {
            setOrder(result);
            // Clear local temporary storage to avoid reuse
            try { localStorage.removeItem('lastOrder'); localStorage.removeItem('lastOrderId'); } catch (e) {}
            setLoading(false);
            return;
          }
        }

        // Fallback: try lastOrder object
        try {
          const raw = localStorage.getItem('lastOrder');
          if (raw) {
            const local = JSON.parse(raw);
            setOrder(local);
            setUsedFallback(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Local fallback read failed', err);
        }

        throw new Error(data?.message || 'Gagal mengambil data pesanan');
      } catch (err) {
        console.error(err);
        setError(err.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderIdParam, orderNumberParam]);

  const formatPrice = (price) => {
    if (price == null) return 'Rp ...';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const total = order?.total_price || order?.bouquet?.price || order?.total || 0;
  const paid = order?.total_paid || order?.paid || 0;

  // If payment method/channel indicates ShopeePay, apply +Rp 1.000 surcharge
  const paymentMethodRaw = (order?.payment_method || order?.payment_method_name || order?.payment_channel || '')?.toString() || '';
  const isShopee = /shopee/i.test(paymentMethodRaw);
  const surcharge = isShopee ? 1000 : 0;

  const displayTotal = Number(total) + surcharge;
  const displayRemaining = Math.max(0, displayTotal - paid);

  // Build WhatsApp message to fixed number
  const whatsappNumber = '6289661175822';
  const paymentProofs = order?.payment_proofs || order?.paymentProofs || order?.payment_proof || order?.paymentProof || [];
  let proofText = '-';
  if (Array.isArray(paymentProofs) && paymentProofs.length > 0) proofText = paymentProofs.join(', ');
  else if (typeof paymentProofs === 'string' && paymentProofs) proofText = paymentProofs;

  const notes = order?.additional_request || order?.note || order?.notes || order?.message || '-';

  const whatsappMessage = [
    `Nama pembeli: ${order?.customer_name || order?.name || '-'}`,
    `Produk yang dipesan: ${order?.bouquet_name || order?.bouquet?.name || '-'}`,
    `Harga: ${formatPrice(displayTotal)}`,
    `DP: ${formatPrice(paid)}`,
    `Sisa pembayaran: ${formatPrice(displayRemaining)}`,
    `Tanggal pengambilan: ${order?.pickup_date || order?.pickupDate || '-'}`,
    `Bukti transfer: ${proofText}`,
    `Catatan tambahan: ${notes}`
  ].join('\n');

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen pb-12 my-12 font-serif">
      <div className="relative z-20">
        <NavBar />
      </div>

      <main className="max-w-3xl mx-auto px-6 pt-20">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">Pesanan Berhasil!</h1>
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
                  <div className="font-medium">{order?.order_number || order?.id || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Tanggal Order</div>
                  <div className="font-medium">{order?.created_at ? new Date(order.created_at).toLocaleDateString() : (order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-')}</div>
                </div>

                <div className="col-span-2 border-t pt-4">
                  <div className="text-xs text-gray-500">Nama Pembeli</div>
                  <div className="font-medium">{order?.customer_name || order?.name || '-'}</div>
                </div>

                <div className="col-span-2 mt-3">
                  <div className="text-xs text-gray-500">Buket yang Dipesan</div>
                  <div className="font-semibold">{order?.bouquet_name || order?.bouquet?.name || '-'}</div>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-gray-500">Tanggal Ambil</div>
                  <div className="font-medium">{order?.pickup_date || order?.pickupDate || '-'}</div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-500">Jam Ambil</div>
                  <div className="font-medium">{order?.pickup_time || order?.pickupTime || '-'}</div>
                </div>

                <div className="col-span-2 mt-3">
                  <div className="text-xs text-gray-500">Pesan Kartu Ucapan</div>
                  <div className="italic text-gray-600">{order?.card_message || order?.message || '-'}</div>
                </div>
              </div>

              <div className="mt-4 bg-pink-50 border-t border-pink-100 rounded-b-md p-4">
                <div className="flex justify-between text-sm text-gray-700 mb-1">
                  <span>Total Harga:</span>
                  <span className="font-semibold">{formatPrice(displayTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 mb-1">
                  <span>Dibayar:</span>
                  <span className="font-semibold">{formatPrice(paid)}</span>
                </div>
                <div className="flex justify-between text-sm text-rose-500">
                  <span>Sisa:</span>
                  <span className="font-semibold">{formatPrice(displayRemaining)}</span>
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
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.478A11.916 11.916 0 0012 .5C5.649.5.999 5.149.999 11.5c0 2.026.546 3.91 1.583 5.568L.5 23.5l6.662-1.74A11.937 11.937 0 0012 23.5c6.351 0 11.001-4.649 11.001-11.001 0-3.087-1.205-5.91-2.481-7.021z"/></svg>
                Hubungi via WhatsApp
              </a>

              <Link href="/" className="flex-1 inline-flex items-center justify-center gap-2 border border-pink-300 text-pink-500 font-semibold py-3 rounded-lg">
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
