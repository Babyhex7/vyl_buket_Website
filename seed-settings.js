const sequelize = require("./src/lib/sequelize");

async function seedSettings() {
  try {
    console.log("🌱 Starting settings seed...");

    // Import models
    const { syncDatabase } = await import("./src/models/index.js");
    await syncDatabase();

    const Setting = (await import("./src/models/Setting.js")).default;

    // Default settings data
    const settings = [
      {
        key: "bank_bca",
        value: "4373021906",
        description: "Nomor rekening BCA",
      },
      {
        key: "bank_bca_name",
        value: "Vina Enjelia",
        description: "Nama pemilik rekening BCA",
      },
      {
        key: "bank_seabank",
        value: "901081198646",
        description: "Nomor rekening SeaBank",
      },
      {
        key: "bank_seabank_name",
        value: "Vina Enjelia",
        description: "Nama pemilik rekening SeaBank",
      },
      {
        key: "ewallet_shopeepay",
        value: "0882002048431",
        description: "Nomor ShopeePay",
      },
      {
        key: "ewallet_shopeepay_name",
        value: "Vina Enjelia",
        description: "Nama pemilik ShopeePay",
      },
      {
        key: "shopeepay_admin_fee",
        value: "1000",
        description: "Biaya admin ShopeePay jika transfer dari bank (Rp)",
      },
      {
        key: "min_dp_percent",
        value: "30",
        description: "Minimal DP dalam persen (%)",
      },
      {
        key: "whatsapp_number",
        value: "",
        description: "Nomor WhatsApp untuk kontak",
      },
      {
        key: "instagram_handle",
        value: "@vylbuket",
        description: "Username Instagram",
      },
    ];

    // Insert or update settings
    for (const setting of settings) {
      const [instance, created] = await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting,
      });

      if (!created) {
        await instance.update({
          value: setting.value,
          description: setting.description,
        });
        console.log(`✅ Updated setting: ${setting.key}`);
      } else {
        console.log(`✨ Created setting: ${setting.key}`);
      }
    }

    console.log("\n✅ Settings seed completed successfully!");
    console.log("\n📋 Seeded settings:");
    console.log("  - BCA: 4373021906 (a.n Vina Enjelia)");
    console.log("  - SeaBank: 901081198646 (a.n Vina Enjelia)");
    console.log("  - ShopeePay: 0882002048431 (a.n Vina Enjelia)");
    console.log("  - ShopeePay Admin Fee: Rp 1.000");
    console.log("  - Minimal DP: 30%");
    console.log(
      "\n💡 Note: Transfer ke ShopeePay dari bank tambah Rp 1.000 untuk admin Shopee"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Settings seed failed:", error);
    process.exit(1);
  }
}

seedSettings();
