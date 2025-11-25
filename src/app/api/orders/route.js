import { NextResponse } from "next/server";
import { Order, Bouquet, OrderImage, sequelize } from "@/models";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET - Read all orders (Protected dengan JWT)
export async function GET(request) {
  try {
    // Cek JWT token dari cookie
    const cookieStore = cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Token required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Get query parameters untuk filter
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("payment_status");
    const pickupDateFrom = searchParams.get("pickup_date_from");
    const pickupDateTo = searchParams.get("pickup_date_to");
    const pickupTimeFrom = searchParams.get("pickup_time_from");
    const pickupTimeTo = searchParams.get("pickup_time_to");
    const searchQuery = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;

    // Build where clause
    const whereClause = {};
    if (status) {
      whereClause.order_status = status;
    }
    if (paymentStatus) {
      whereClause.payment_status = paymentStatus;
    }
    
    // Filter tanggal pengambilan (range)
    if (pickupDateFrom || pickupDateTo) {
      whereClause.pickup_date = {};
      if (pickupDateFrom) {
        whereClause.pickup_date[sequelize.Sequelize.Op.gte] = pickupDateFrom;
      }
      if (pickupDateTo) {
        whereClause.pickup_date[sequelize.Sequelize.Op.lte] = pickupDateTo;
      }
    }
    
    // Filter waktu pengambilan (range)
    if (pickupTimeFrom || pickupTimeTo) {
      whereClause.pickup_time = {};
      if (pickupTimeFrom) {
        whereClause.pickup_time[sequelize.Sequelize.Op.gte] = pickupTimeFrom;
      }
      if (pickupTimeTo) {
        whereClause.pickup_time[sequelize.Sequelize.Op.lte] = pickupTimeTo;
      }
    }
    
    if (searchQuery) {
      whereClause[sequelize.Sequelize.Op.or] = [
        { customer_name: { [sequelize.Sequelize.Op.like]: `%${searchQuery}%` } },
        { order_number: { [sequelize.Sequelize.Op.like]: `%${searchQuery}%` } }
      ];
    }

    // Fetch orders dengan relasi
    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: Bouquet,
          as: "bouquet",
          attributes: ["id", "name", "price", "image_url", "description"],
        },
        {
          model: OrderImage,
          as: "images",
          attributes: ["id", "image_url", "image_type", "display_order"],
          order: [["display_order", "ASC"]],
        },
      ],
      order: [["created_at", "ASC"]],
      limit,
      offset,
    });

    // Count total
    const total = await Order.count({ where: whereClause });

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("GET Orders error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new order (Public - untuk customer)
export async function POST(request) {
  const transaction = await sequelize.transaction();

  try {
    const body = await request.json();

    // Validasi input required
    const requiredFields = [
      "customer_name",
      "bouquet_id",
      "pickup_date",
      "pickup_time",
      "payment_type",
      "sender_name",
      "payment_method",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        await transaction.rollback();
        return NextResponse.json(
          { success: false, message: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Cek bouquet exists
    const bouquet = await Bouquet.findByPk(body.bouquet_id);
    if (!bouquet) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: "Bouquet not found" },
        { status: 404 }
      );
    }

    if (!bouquet.is_active) {
      await transaction.rollback();
      return NextResponse.json(
        { success: false, message: "Bouquet is not available" },
        { status: 400 }
      );
    }

    // Generate order number (format: ORD-YYYYMMDD-XXXX)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await Order.count({
      where: sequelize.where(
        sequelize.fn("DATE", sequelize.col("created_at")),
        today.toISOString().slice(0, 10)
      ),
    });
    const orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(4, "0")}`;

    // Hitung payment
    const bouquetPrice = parseFloat(bouquet.price);
    let dpAmount = 0;
    let remainingAmount = 0;
    let totalPaid = 0;
    let paymentStatus = "UNPAID";

    if (body.payment_type === "DP") {
      // DP 30%
      dpAmount = bouquetPrice * 0.3;
      remainingAmount = bouquetPrice - dpAmount;
      totalPaid = 0; // Belum bayar, menunggu konfirmasi
    } else if (body.payment_type === "FULL") {
      dpAmount = 0;
      remainingAmount = 0;
      totalPaid = 0; // Belum bayar, menunggu konfirmasi
    }

    // Create order
    const order = await Order.create(
      {
        order_number: orderNumber,
        bouquet_id: body.bouquet_id,
        customer_name: body.customer_name,
        sender_name: body.sender_name,
        sender_account_number: body.sender_account_number || null,
        sender_phone: body.sender_phone || null,
        bouquet_price: bouquetPrice,
        payment_type: body.payment_type,
        payment_method: body.payment_method,
        dp_amount: dpAmount,
        remaining_amount: remainingAmount,
        total_paid: totalPaid,
        pickup_date: body.pickup_date,
        pickup_time: body.pickup_time,
        additional_request: body.additional_request || null,
        card_message: body.card_message || null,
        order_status: "WAITING_CONFIRMATION",
        payment_status: paymentStatus,
        whatsapp_sent: false,
      },
      { transaction }
    );
(body.desired_bouquet_images && Array.isArray(body.desired_bouquet_images)); {
      for (let i = 0; i < body.desired_bouquet_images.length; i++) {
        await OrderImage.create(
          {
            order_id: order.id,
            image_url: body.desired_bouquet_images[i],
            image_type: "DESIRED_BOUQUET",
            display_order: i + 1,
          },
          { transaction }
        );
      }
    }

    // Simpan foto referensi (bisa lebih dari 1)
    if (body.reference_images && Array.isArray(body.reference_images)) {
      for (let i = 0; i < body.reference_images.length; i++) {
        await OrderImage.create(
          {
            order_id: order.id,
            image_url: body.reference_images[i],
            image_type: "REFERENCE",
            display_order: i + 1,
          },
          { transaction }
        );
      }
    }

    // Simpan bukti transfer (bisa lebih dari 1)
    if (body.payment_proofs && Array.isArray(body.payment_proofs)) {
      for (let i = 0; i < body.payment_proofs.length; i++) {
        await OrderImage.create(
          {
            order_id: order.id,
            image_url: body.payment_proofs[i],
            image_type: "PAYMENT_PROOF",
            display_order: i + 1,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    // Fetch order lengkap dengan relasi
    const createdOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: Bouquet,
          as: "bouquet",
          attributes: ["id", "name", "price", "image_url"],
        },
        {
          model: OrderImage,
          as: "images",
          order: [["display_order", "ASC"]],
        },
      ],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    await transaction.rollback();
    console.error("POST Order error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
