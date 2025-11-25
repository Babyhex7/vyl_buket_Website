import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Order, Bouquet, OrderImage } from "@/models";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    // Verify token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" },
        { status: 401 }
      );
    }

    const { id } = params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: Bouquet,
          as: "bouquet",
          attributes: ["id", "name", "price", "image_url"],
        },
        {
          model: OrderImage,
          as: "images",
          attributes: ["id", "image_url", "image_type"],
        },
      ],
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Verify token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const order = await Order.findByPk(id);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    await order.update(body);

    return NextResponse.json({
      success: true,
      message: "Order updated",
      data: order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
