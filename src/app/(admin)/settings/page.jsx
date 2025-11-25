'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../hooks/useToast';
import { useAuth } from '../../../hooks/useAuth';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const showToast = useToast(); // Toast notifications
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    payment_bca: '',
    payment_bca_desc: '',
    payment_seabank: '',
    payment_seabank_desc: '',
    payment_shopeepay: '',
    payment_shopeepay_desc: '',
    min_dp_percent: '30',
    whatsapp_number: '',
    instagram_handle: '',
  });

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.success) {
        setSettings({
          payment_bca: data.data.payment_bca?.value || '',
          payment_bca_desc: data.data.payment_bca?.description || '',
          payment_seabank: data.data.payment_seabank?.value || '',
          payment_seabank_desc: data.data.payment_seabank?.description || '',
          payment_shopeepay: data.data.payment_shopeepay?.value || '',
          payment_shopeepay_desc: data.data.payment_shopeepay?.description || '',
          min_dp_percent: data.data.min_dp_percent || '30',
          whatsapp_number: data.data.whatsapp_number || '',
          instagram_handle: data.data.instagram_handle || '',
        });
      }
    } catch (error) {
      console.error('Fetch settings error:', error);
      showToast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchSettings();
    }
  }, [user, authLoading, router]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi
    if (!settings.payment_bca && !settings.payment_seabank && !settings.payment_shopeepay) {
      showToast.error('Minimal satu metode pembayaran harus diisi');
      return;
    }

    if (settings.min_dp_percent && (isNaN(settings.min_dp_percent) || settings.min_dp_percent < 0 || settings.min_dp_percent > 100)) {
      showToast.error('Minimal DP harus antara 0-100%');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare data dengan struktur value dan description
      const settingsData = {
        payment_bca: { value: settings.payment_bca, description: settings.payment_bca_desc },
        payment_seabank: { value: settings.payment_seabank, description: settings.payment_seabank_desc },
        payment_shopeepay: { value: settings.payment_shopeepay, description: settings.payment_shopeepay_desc },
        min_dp_percent: settings.min_dp_percent,
        whatsapp_number: settings.whatsapp_number,
        instagram_handle: settings.instagram_handle,
      };
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      const data = await response.json();

      if (data.success) {
        showToast.success('Pengaturan berhasil disimpan');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Save settings error:', error);
      showToast.error('Gagal menyimpan pengaturan: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pengaturan Pembayaran & Ketentuan</h1>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Kelola informasi pembayaran dan ketentuan pemesanan</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* DP Settings */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Pengaturan DP</h2>
          
          <div>
            <Input
              label="Persentase Minimal DP (%)"
              name="min_dp_percent"
              type="number"
              value={settings.min_dp_percent}
              onChange={handleChange}
              placeholder="30"
              min="0"
              max="100"
            />
            <p className="text-sm text-gray-500 mt-1">Minimal persentase DP yang harus dibayar customer</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Metode Pembayaran</h2>
          
          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">BCA</h3>
            <div className="mb-3">
              <Input
                label="Nomor Rekening BCA"
                name="payment_bca"
                value={settings.payment_bca}
                onChange={handleChange}
                placeholder="3741159803"
              />
            </div>
            <div>
              <Input
                label="Nama Pemilik Rekening BCA"
                name="payment_bca_desc"
                value={settings.payment_bca_desc}
                onChange={handleChange}
                placeholder="Muhammad Nashirul Haq Resa"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">SeaBank</h3>
            <div className="mb-3">
              <Input
                label="Nomor Rekening SeaBank"
                name="payment_seabank"
                value={settings.payment_seabank}
                onChange={handleChange}
                placeholder="901763996563"
              />
            </div>
            <div>
              <Input
                label="Nama Pemilik Rekening SeaBank"
                name="payment_seabank_desc"
                value={settings.payment_seabank_desc}
                onChange={handleChange}
                placeholder="Muhammad Nashirul Haq Resa"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">ShopeePay</h3>
            <div className="mb-3">
              <Input
                label="Nomor ShopeePay"
                name="payment_shopeepay"
                value={settings.payment_shopeepay}
                onChange={handleChange}
                placeholder="085161553414"
              />
            </div>
            <div>
              <Input
                label="Nama Pemilik ShopeePay"
                name="payment_shopeepay_desc"
                value={settings.payment_shopeepay_desc}
                onChange={handleChange}
                placeholder="Muhammad Nashirul Haq Resa"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-pink-500 font-medium">💡 Catatan: Transfer ShopeePay dari bank dikenakan biaya admin +Rp 1.000</p>
          </div>
        </div>

        {/* Operational Hours */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Jam Operasional</h2>
          
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">Jam Pengambilan</h3>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              rows="3"
              placeholder="Senin-Sabtu: 08.00-18.00 WIB | Minggu: 10.00-15.00 WIB"
              defaultValue="Senin-Sabtu: 08.00-18.00 WIB | Minggu: 10.00-15.00 WIB"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-pink-600 active:bg-pink-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed w-full max-w-md flex items-center justify-center gap-2 text-sm sm:text-base touch-target"
          >
            <span>💾</span>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>
    </div>
  );
}
