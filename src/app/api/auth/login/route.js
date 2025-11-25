import { NextResponse } from "next/server";
import { comparePassword, generateToken } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

// Helper to load Admin model safely with clearer errors
async function getAdminModel() {
  try {
    const module = await import("../../../../models/Admin");
    return module.default || module.Admin || module;
  } catch (err) {
    console.error("Failed loading Admin model:", err);
    throw new Error("MODEL_LOAD_FAILED");
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    // Pastikan koneksi database siap (optional lightweight ping)
    // NOTE: We avoid a full sync here for performance; ensure migrations ran.

    const Admin = await getAdminModel();
    const admin = await Admin.findOne({ where: { username, is_active: true } });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      full_name: admin.full_name,
    });

    // Create response dengan cookie dan token
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      token: token, // Kirim token juga di response body
      data: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        email: admin.email,
      },
    });

    // Set cookie untuk token
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    if (error?.message === "MODEL_LOAD_FAILED") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Model tidak dapat dimuat. Pastikan server telah restart setelah perubahan.",
        },
        { status: 500 }
      );
    }
    console.error("Login error:", error?.message, error?.stack);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
