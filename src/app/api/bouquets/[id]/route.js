import { NextResponse } from "next/server";
import { authMiddleware } from "../../../../middleware/authMiddleware";

export const dynamic = "force-dynamic";

// GET - Ambil bouquet by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Load Bouquet model
    const Bouquet = (await import("../../../../models/Bouquet")).default;

    const bouquet = await Bouquet.findByPk(id);

    if (!bouquet) {
      return NextResponse.json(
        { success: false, message: "Bouquet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bouquet,
    });
  } catch (error) {
    console.error("Get bouquet error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update bouquet
export const PUT = authMiddleware(async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, price, description, image_url, is_active } = body;

    // Validasi
    if (name && name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Name cannot be empty" },
        { status: 400 }
      );
    }

    if (price !== undefined && (isNaN(price) || price < 0)) {
      return NextResponse.json(
        { success: false, message: "Invalid price" },
        { status: 400 }
      );
    }

    // Load Bouquet model
    const Bouquet = (await import("../../../../models/Bouquet")).default;

    const bouquet = await Bouquet.findByPk(id);
    if (!bouquet) {
      return NextResponse.json(
        { success: false, message: "Bouquet not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (name !== undefined) bouquet.name = name;
    if (price !== undefined) bouquet.price = price;
    if (description !== undefined) bouquet.description = description;
    if (image_url !== undefined) bouquet.image_url = image_url;
    if (is_active !== undefined) bouquet.is_active = is_active;

    await bouquet.save();

    return NextResponse.json({
      success: true,
      message: "Bouquet updated successfully",
      data: bouquet,
    });
  } catch (error) {
    console.error("Update bouquet error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});

// DELETE - Hapus bouquet
export const DELETE = authMiddleware(async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = params;

    // Load Bouquet model
    const Bouquet = (await import("../../../../models/Bouquet")).default;

    const bouquet = await Bouquet.findByPk(id);
    if (!bouquet) {
      return NextResponse.json(
        { success: false, message: "Bouquet not found" },
        { status: 404 }
      );
    }

    await bouquet.destroy();

    return NextResponse.json({
      success: true,
      message: "Bouquet deleted successfully",
    });
  } catch (error) {
    console.error("Delete bouquet error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
});
