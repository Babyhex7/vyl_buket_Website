import { NextResponse } from "next/server";
import { authMiddleware } from "../../../middleware/authMiddleware";

// GET - Ambil semua settings
export async function GET(request) {
  try {
    // Load Setting model
    const Setting = (await import("../../../models/Setting")).default;

    // Get all settings
    const settings = await Setting.findAll();

    // Convert to key-value object with description
    const settingsObj = {};
    settings.forEach((setting) => {
      settingsObj[setting.key] = {
        value: setting.value,
        description: setting.description,
      };
    });

    return NextResponse.json({
      success: true,
      data: settingsObj,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update settings
export const PUT = authMiddleware(async function PUT(request) {
  try {
    const body = await request.json();

    // Load Setting model
    const Setting = (await import("../../../models/Setting")).default;

    // Update or create each setting
    const updatePromises = Object.entries(body).map(async ([key, data]) => {
      // Handle both object {value, description} and primitive value
      const value = typeof data === 'object' && data !== null ? data.value : data;
      const description = typeof data === 'object' && data !== null ? data.description : null;
      
      const [setting, created] = await Setting.findOrCreate({
        where: { key },
        defaults: { key, value, description },
      });

      if (!created) {
        setting.value = value;
        setting.description = description;
        await setting.save();
      }

      return setting;
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: "Settings berhasil diupdate",
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});
