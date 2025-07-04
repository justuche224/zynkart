"use client";

import { Trash2, Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import formatPrice from "@/lib/price-formatter";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import Navbar from "./_components/navbar";
import { StoreDataFromHomePage } from "@/lib/store-utils";
import { Footer } from "./_components/footer";
import Image from "next/image";

const CartPage = ({ store }: { store: StoreDataFromHomePage }) => {
  const { items, removeItem, updateItemQuantity, clearCart } = useCartStore();
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <section className="flex flex-col min-h-screen">
        <Navbar storeSlug={store.slug} storeName={store.name} storeId={store.id}  />

        <div className="container max-w-6xl mx-auto px-4 py-8 mt-16 flex-1">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">
              Add some items to your cart to get started!
            </p>
            <Link href="/">
              <Button>Continue Shopping</Button>
            </Link>
          </Card>
        </div>
        <Footer storeSlug={store.slug} />
      </section>
    );
  }

  return (
    <section className="flex flex-col min-h-screen bg-[#fff] md:pt-16 pt-24 dark:bg-[#252525]">
      <Navbar storeSlug={store.slug} storeName={store.name} storeId={store.id} />
      <div className="container max-w-6xl mx-auto px-4 py-8 mt-20 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">
                Shopping Cart ({items.length})
              </h1>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-red-500">
                    Clear Cart
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Shopping Cart</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove all items from your cart?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 dark:bg-[#121212] bg-[#f5f5f5] text-white"
                >
                  <div className="flex gap-4">
                    <Link href={`/products/${item.productSlug}`}>
                      <Image
                        width={96}
                        height={96}
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded cursor-pointer"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className=" text-gray-900 dark:text-gray-400 font-bold">
                          <Link href={`/products/${item.productSlug}`}>
                            {item.name}
                          </Link>
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-900 hover:text-red-500 dark:text-gray-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-gray-900 mt-1 dark:text-gray-400">
                        {formatPrice(item.price, "en-NG", "NGN")}
                      </p>

                      <div className="flex items-center mt-4">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() =>
                              updateItemQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-400"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-2 text-center min-w-[3rem] text-gray-900 dark:text-gray-400">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity + 1)
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-400"
                            disabled={
                              item.inStock !== undefined &&
                              item.quantity >= item.inStock
                            }
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {item.trackQuantity && item.inStock !== undefined && (
                          <span className="ml-4 text-sm text-gray-900 dark:text-gray-400">
                            {item.inStock} available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 dark:bg-[#121212] bg-[#f5f5f5] text-white">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-400">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-900 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-gray-400">{formatPrice(subtotal, "en-NG", "NGN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 dark:text-gray-400">Shipping</span>
                  <span className="text-gray-900 dark:text-gray-400">
                    {shipping === 0
                      ? "-"
                      : `${formatPrice(shipping, "en-NG", "NGN")}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-gray-400">{formatPrice(total, "en-NG", "NGN")}</span>
                </div>
                <Link href="/checkout">
                  <Button className="w-full mt-4">Proceed to Checkout</Button>
                </Link>
                {/* <p className="text-sm text-gray-500 text-center mt-2">
                Free shipping on orders over $100
              </p> */}
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer storeSlug={store.slug} />
    </section>
  );
};

export default CartPage;
