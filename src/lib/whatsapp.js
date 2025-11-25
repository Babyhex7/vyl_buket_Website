// WhatsApp API integration

export async function sendWhatsAppMessage(phoneNumber, message) {
  // TODO: Implement WhatsApp API integration
  // Bisa pakai WhatsApp Business API atau service seperti Fonnte, Wablas, dll

  console.log("Sending WhatsApp to:", phoneNumber);
  console.log("Message:", message);

  return {
    success: true,
    message: "WhatsApp sent",
  };
}

export function formatOrderWhatsAppMessage(order, settings) {
  // Format tanggal dalam bahasa Indonesia
  const pickupDate = new Date(order.pickup_date);
  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = pickupDate.toLocaleDateString('id-ID', dateOptions);
  
  // Format harga
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // Ambil payment methods dari settings atau gunakan default
  const paymentMethods = settings?.payment_methods || [
    { name: 'BCA', account_number: '4373021906', account_name: 'Vina Enjelia' },
    { name: 'SeaBank', account_number: '901081198646', account_name: 'Vina Enjelia' },
    { name: 'ShopeePay', account_number: '0882002048431', account_name: 'Vina Enjelia', note: '(TF SHOPEEPAY DARI BANK TAMBAH 1k untuk admin shopee)' }
  ];

  const paymentMethodsText = paymentMethods.map(pm => 
    `${pm.name}: ${pm.account_number} (a.n ${pm.account_name}) ${pm.note || ''}`
  ).join('\n');

  let message = `*═══ INVOICE ORDER VYL.BOUQUET ═══*\n\n`;
  message += `📋 *DETAIL PESANAN*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📝 *No. Pesanan:* ${order.order_number}\n`;
  message += `👤 *Nama:* ${order.customer_name}\n`;
  message += `💐 *Buket:* ${order.bouquet?.name || 'Custom'}\n`;
  message += `💰 *Harga Buket:* Rp ${formatPrice(order.bouquet_price)}\n`;
  message += `📊 *Status:* Menunggu Konfirmasi Pembayaran\n\n`;

  // Kartu ucapan
  if (order.card_message) {
    message += `💌 *Kartu Ucapan FREE:*\n`;
    message += `_"${order.card_message}"_\n\n`;
  }

  message += `📅 *Tanggal Pengambilan:* ${formattedDate}\n`;
  message += `⏰ *Jam Pengambilan:* ${order.pickup_time} WIB\n`;
  message += `💳 *Metode Pembayaran:* ${order.payment_method}\n`;
  message += `💸 *Jenis Pembayaran:* ${order.payment_type === 'DP' ? `DP 30% (Rp ${formatPrice(order.dp_amount)})` : `Lunas (Rp ${formatPrice(order.bouquet_price)})`}\n\n`;

  // Request tambahan
  if (order.additional_request) {
    message += `📋 *REQUEST:*\n`;
    message += `${order.additional_request}\n\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `💳 *INFORMASI PEMBAYARAN*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `${paymentMethodsText}\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📌 *CATATAN PENTING*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `✅ Pembayaran di awal DP 30%\n`;
  message += `✅ Pesanan di-keep setelah DP diterima\n\n`;

  message += `🕐 *JAM OPERASIONAL PENGAMBILAN*\n`;
  message += `• Senin - Sabtu: 08.00 - 18.00 WIB\n`;
  message += `• Minggu: 10.00 - 15.00 WIB\n\n`;

  message += `⚠️ *Jika pesanan diambil oleh orang lain:*\n`;
  message += `Tolong minta orang yang mengambil untuk mengirimkan:\n`;
  message += `1. Format order ini\n`;
  message += `2. Foto bunga yang dipesan\n\n`;

  message += `⏱️ Jam pengambilan sesuai kesepakatan, tidak ada percepatan waktu.\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `✨ *Terima kasih atas kepercayaan Anda!*\n`;
  message += `Kami akan memproses pesanan Anda dengan sepenuh hati 💕\n\n`;
  message += `Silakan kirimkan bukti transfer untuk konfirmasi pesanan Anda.\n`;
  message += `Jika ada pertanyaan, jangan ragu untuk menghubungi kami! 🌸`;

  return message;
}
