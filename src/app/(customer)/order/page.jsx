"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import NavBar from '../../../components/ui/NavBar';

export default function OrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bouquetIdParam = searchParams.get('bouquet_id');

  const [bouquets, setBouquets] = useState([]);
  const [selectedBouquet, setSelectedBouquet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    bouquet_id: bouquetIdParam || '',
    pickup_date: '',
    pickup_time: '',
    card_message: '',
    additional_request: '',
    payment_type: 'DP',
    sender_name: '',
    sender_account_number: '',
    sender_phone: '',
  });

  const [referenceFiles, setReferenceFiles] = useState([]);
  const [paymentFiles, setPaymentFiles] = useState([]);

  useEffect(() => {
    fetchBouquets();
  }, []);

  useEffect(() => {
    if (bouquetIdParam && bouquets.length > 0) {
      const bouquet = bouquets.find(b => b.id === parseInt(bouquetIdParam));
      if (bouquet) {
        setSelectedBouquet(bouquet);
        setFormData(prev => ({ ...prev, bouquet_id: bouquetIdParam }));
      }
    }
  }, [bouquetIdParam, bouquets]);

  const fetchBouquets = async () => {
    try {
      const response = await fetch('/api/bouquets');
      const data = await response.json();
      if (data.success) {
        setBouquets(data.data.filter(b => b.is_active));
      }
    } catch (error) {
      console.error('Error fetching bouquets:', error);
    }
  };

  const handleBouquetChange = (e) => {
    const bouquetId = e.target.value;
    setFormData({ ...formData, bouquet_id: bouquetId });
    const bouquet = bouquets.find(b => b.id === parseInt(bouquetId));
    setSelectedBouquet(bouquet);
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'reference') {
      setReferenceFiles(files);
    } else {
      setPaymentFiles(files);
    }
  };

  const uploadFiles = async (files, type) => {
    if (files.length === 0) return [];

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('type', 'orders');

    try {
      const response = await fetch('/api/upload/multiple', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        return data.urls;
      }
      throw new Error(data.message);
    } catch (error) {
      alert(`Error uploading ${type} images: ${error.message}`);
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload reference images
      const refUrls = await uploadFiles(referenceFiles, 'reference');
      
      // Upload payment proof images
      const payUrls = await uploadFiles(paymentFiles, 'payment');

      // Create order
      const orderData = {
        ...formData,
        reference_images: refUrls,
        payment_proofs: payUrls,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Pesanan berhasil dibuat!\nNomor Order: ${data.data.order_number}`);

        // --- DUMMY FALLBACK: save submitted order to localStorage ---
        // This is temporary logic so the `order-success` page can display details
        // even when the real API/endpoint is not ready. Replace this with
        // proper backend-backed logic (don't rely on localStorage in prod).
        try {
          const serverOrder = data.data || {};
          const fallbackOrder = {
            id: serverOrder.id,
            order_number: serverOrder.order_number,
            created_at: serverOrder.created_at || new Date().toISOString(),
            customer_name: orderData.customer_name,
            bouquet: selectedBouquet || null,
            bouquet_name: selectedBouquet?.name || serverOrder.bouquet_name || '',
            pickup_date: orderData.pickup_date,
            pickup_time: orderData.pickup_time,
            card_message: orderData.card_message,
            reference_images: orderData.reference_images,
            payment_proofs: orderData.payment_proofs,
            total_price: selectedBouquet ? selectedBouquet.price : serverOrder.total_price,
            total_paid: serverOrder.total_paid || (orderData.payment_type === 'FULL' ? (selectedBouquet?.price || 0) : (selectedBouquet ? (selectedBouquet.price * 0.5) : 0)),
            sender_phone: orderData.sender_phone,
            sender_name: orderData.sender_name,
          };
          localStorage.setItem('lastOrder', JSON.stringify(fallbackOrder));
        } catch (err) {
          // Ignore localStorage errors (e.g., incognito/storage disabled)
          console.warn('Could not write lastOrder to localStorage', err);
        }

        // Redirect to order-success and include order identifier so the success page can fetch details
        const orderId = data.data.id || data.data.order_number;
        router.push(`/order-success?order_id=${encodeURIComponent(orderId)}`);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculatePayment = () => {
    if (!selectedBouquet) return { dp: 0, remaining: 0, total: 0 };
    const total = parseFloat(selectedBouquet.price);
    const dp = formData.payment_type === 'DP' ? total * 0.5 : total;
    const remaining = formData.payment_type === 'DP' ? total - dp : 0;
    return { dp, remaining, total };
  };

  const payment = calculatePayment();

  return (
    <div className="min-h-screen bg-amber-50 py-12 px-4">
      <div className="relative z-20">
        <NavBar />
      </div>

      <div className="max-w-6xl mx-auto pt-14">
        <h1 className="text-4xl font-serif font-bold text-center mb-2">Form Pemesanan</h1>
        <p className="text-center text-amber-700 mb-8">Lengkapi data pesanan Anda</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form (span 2 columns on large) */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 lg:p-8 border border-pink-100">
              <div className="text-lg font-semibold mb-4 px-2">Detail Pesanan</div>

              {/* Pilih Buket */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama Pembeli *</label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Pilih Buket *</label>
                <select
                  required
                  value={formData.bouquet_id}
                  onChange={handleBouquetChange}
                  className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200"
                >
                  <option value="">Pilih buket yang Anda inginkan</option>
                  {bouquets.map(bouquet => (
                    <option key={bouquet.id} value={bouquet.id}>{bouquet.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tanggal Ambil *</label>
                  <input type="date" required value={formData.pickup_date} onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Jam Ambil *</label>
                  <input type="time" required value={formData.pickup_time} onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Pesan Untuk Kartu Ucapan</label>
                <textarea value={formData.card_message} onChange={(e) => setFormData({ ...formData, card_message: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" rows={3} placeholder="Tulis pesan untuk kartu ucapan" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Foto Request Tambahan (Opsional)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'reference')} className="w-full px-3 py-2 border border-dashed border-pink-200 rounded-md" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Request Tambahan (Opsional)</label>
                <input type="text" value={formData.additional_request} onChange={(e) => setFormData({ ...formData, additional_request: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" placeholder="Jelaskan request khusus untuk buket Anda" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tipe Pembayaran *</label>
                <select value={formData.payment_type} onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200">
                  <option value="DP">Bayar 50% atau Lunas</option>
                  <option value="FULL">Lunas</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nama Pengirim / No Rekening *</label>
                <input type="text" required value={formData.sender_name} onChange={(e) => setFormData({ ...formData, sender_name: e.target.value })} className="w-full px-3 py-2 border border-pink-200 rounded-md focus:ring-2 focus:ring-pink-200" placeholder="Nama pengirim" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Upload Bukti Transfer / DP (opsional)</label>
                <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'payment')} className="w-full px-3 py-2 border border-dashed border-pink-200 rounded-md" />
              </div>

              <button type="submit" disabled={loading || uploading} className="w-full bg-pink-400 hover:bg-pink-500 text-white font-semibold py-3 rounded-md mt-4">
                {uploading ? 'Mengupload gambar...' : loading ? 'Memproses pesanan...' : 'Kirim Pesanan Anda'}
              </button>
            </form>
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-6">
            <div className="p-4 bg-pink-100 rounded-lg border border-pink-200">
              <h3 className="font-semibold mb-2">Ringkasan Pembayaran</h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span>Harga Buket</span><span>{selectedBouquet ? formatPrice(payment.total) : 'Rp ...'}</span></div>
                {formData.payment_type === 'DP' && (
                  <>
                    <div className="flex justify-between text-sm"><span>DP (50%)</span><span>{selectedBouquet ? formatPrice(payment.dp) : 'Rp ...'}</span></div>
                    <div className="flex justify-between text-sm"><span>Sisa</span><span>{selectedBouquet ? formatPrice(payment.remaining) : 'Rp ...'}</span></div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-pink-200">
              <h3 className="font-semibold mb-2">Metode Pembayaran</h3>
              <div className="text-sm space-y-2">
                <div><strong>BCA:</strong> 4370321906 a.n Vina Enjelia</div>
                <div><strong>SeaBank:</strong> 901081198646 a.n Vina Enjelia</div>
                <div><strong>ShopePay:</strong> 0882002048431 a.n Vina Enjelia</div>
                <p className="text-xs text-pink-400 mt-2">Transfer dari bank dikenakan biaya admin +Rp 1.000</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-pink-200">
              <h3 className="font-semibold mb-2">Ketentuan Pemesanan</h3>
              <ul className="text-sm list-disc pl-5 space-y-2 text-gray-600">
                <li>DP minimal 30% dari total harga untuk mengunci pesanan</li>
                <li>Pesanan dianggap diterima setelah DP dikonfirmasi</li>
                <li>Pelunasan bisa dilakukan saat ambil atau H-1</li>
                <li>Jika diambil orang lain, wajib tunjukkan form order dan foto buket</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
