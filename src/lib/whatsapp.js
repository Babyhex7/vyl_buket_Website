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

export function formatOrderWhatsAppMessage(order) {
  return `
🌸 *PESANAN BARU* 🌸

*No. Order:* ${order.order_number}
*Nama:* ${order.customer_name}
*Buket:* ${order.bouquet_name}
*Harga:* Rp ${order.bouquet_price.toLocaleString("id-ID")}
*Jenis Pembayaran:* ${order.payment_type === "DP" ? "DP" : "Lunas"}
*Tanggal Ambil:* ${order.pickup_date}
*Jam Ambil:* ${order.pickup_time}

Silakan cek admin panel untuk konfirmasi.
  `.trim();
}
