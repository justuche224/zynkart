import { NextResponse } from "next/server";
import db from "@/db";
import { order, orderItem, product, store } from "@/db/schema";
import { and, eq, inArray, or } from "drizzle-orm";
import { orderInfoSchema } from "@/schemas";
import { serverCustomerAuth } from "@/lib/server-auth";

export async function POST(req: Request) {
  console.log("POST /api/store/order");

  try {
    const user = await serverCustomerAuth();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const validatedData = orderInfoSchema.safeParse(body);
    if (!validatedData.success) {
      return new NextResponse(
        JSON.stringify({ errors: validatedData.error.errors }),
        { status: 400 }
      );
    }

    const orderInfo = validatedData.data;
    // console.log(orderInfo);

    if (user.id !== orderInfo.customerId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const storeInfo = await db.query.store.findFirst({
      where: eq(store.slug, orderInfo.storeSlug),
      columns: { id: true, slug: true },
      with: {
        bank: { columns: { subaccountCode: true } },
      },
    });

    if (!storeInfo) {
      // console.log(storeInfo);
      return new NextResponse("Store not found", { status: 404 });
    }

    if (!storeInfo?.bank?.subaccountCode) {
      return new NextResponse(
        "This store cannot accept payments yet! try contacting them for more infomation",
        {
          status: 400,
        }
      );
    }

    const orderId = crypto.randomUUID();
    // console.log(orderId);

    const paystackParams = {
      email: user.email,
      amount: orderInfo.totalAmount * 100,
      subaccount: storeInfo.bank.subaccountCode,
      callback_url: `https://${storeInfo.slug}.zynkart.store/api/store/order/confirmation?orderId=${orderId}&storeSlug=${storeInfo.slug}`,
      // callback_url: `http://${storeInfo.slug}.localhost:3000/api/store/order/confirmation?orderId=${orderId}&storeSlug=${storeInfo.slug}`,
      metadata: {
        storeId: orderInfo.storeId,
        customerId: user.id,
        orderId,
      },
    };

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackParams),
      }
    );

    const responseData = await paystackResponse.json();

    if (!responseData.status || !responseData.data?.authorization_url) {
      return new NextResponse("Failed to initialize payment", { status: 400 });
    }

    const productIds = orderInfo.items.map((item) => item.productId);
    
    // Query products by both ID and slug to handle both cases
    const products = await db.query.product.findMany({
      where: and(or(
        inArray(product.id, productIds),
        inArray(product.slug, productIds)
      ), eq(product.storeId, orderInfo.storeId)),
      columns: { id: true, name: true, slug: true },
      with: {
        // variants: {
        //   columns: { id: true, colorId: true, sizeId: true },
        //   with: {
        //     color: { columns: { name: true } },
        //     size: { columns: { name: true } },
        //   },
        // },
      },
    });

    // Create a map that can handle both ID and slug lookups
    const productMap = new Map();
    products.forEach(p => {
      productMap.set(p.id, p);
      productMap.set(p.slug, p);
    });
    // console.log("productMap", productMap);

    // TODO: add variant details to the order item
   await db.transaction(async (tx) => {
      const createdOrder = await tx
        .insert(order)
        .values({
          id: orderId,
          customerId: user.id,
          storeId: orderInfo.storeId,
          paymentStatus: "PENDING",
          fulfillmentStatus: "PROCESSING",
          paymentReference: responseData.data.reference,
          paymentAccessCode: responseData.data.access_code,
          subtotal: orderInfo.subtotal,
          total: orderInfo.totalAmount,
          shippingCost: orderInfo.shippingCost,
          shippingInfo: orderInfo.shippingInfo,
        })
        .returning({ id: order.id });

      if (!createdOrder[0].id) throw Error("Failed to create order");

      await tx.insert(orderItem).values(
        orderInfo.items.map((item) => {
          // console.log(item);
          const product = productMap.get(item.productId);
          if (!product) throw new Error(`Product not found: ${item.productId}`);
          // let variantDetails = "";
          // if (item?.variantId) {
          //   const variant = product.variants.find(
          //     (v) => v.id === item?.variantId
          //   );
          //   if (variant) {
          //     variantDetails = `Color: ${variant?.color}, Size: ${variant?.size}`;
          //   }
          // }
          return {
            orderId: createdOrder[0].id,
            productId: product.id,
            // variantId: item?.variantId || null,
            quantity: item.quantity,
            price: item.price,
            productName: product.name,
            // variantDetails: variantDetails || null,
            storeId: orderInfo.storeId,
          };
        })
      );

      return createdOrder;
    });

    return NextResponse.json({
      authorization_url: responseData.data.authorization_url,
    });
  } catch (error) {
    console.error("Error in /api/store/order:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
