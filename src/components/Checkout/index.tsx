"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";

const Checkout = () => {
  const router = useRouter();
  
  // States quản lý dữ liệu
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State lấy từ các component con
  const [shippingAddress, setShippingAddress] = useState("");
  const [discountId, setDiscountId] = useState<string | null>(null);
  const [discountRate, setDiscountRate] = useState(0);

  // 1. Lấy dữ liệu giỏ hàng khi vào trang
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch('/api/carts/my-cart'); 
        const data = await res.json();
        if (data?.cartItems) {
          setCartItems(data.cartItems);
        }
      } catch (error) {
        console.error("Failed to fetch cart", error);
      }
    };
    fetchCart();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const discountAmount = (subtotal * discountRate) / 100;
  const total = subtotal - discountAmount;
  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress) {
      alert("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }

    setLoading(true);
    try {
      const orderRes = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify({
          shippingAddress: shippingAddress,
          discountId: discountId
        })
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.message || 'Không thể tạo đơn hàng (Có thể hết hàng)');
      }

      const orderData = await orderRes.json();
      const newOrderId = orderData.id; // Lấy ID đơn hàng vừa tạo

      // BƯỚC B: Gọi API Stripe để lấy link thanh toán
      const stripeRes = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify({ id: newOrderId })
      });

      if (!stripeRes.ok) throw new Error('Lỗi khởi tạo thanh toán');

      const stripeData = await stripeRes.json();

      // BƯỚC C: Chuyển hướng user sang trang thanh toán của Stripe
      if (stripeData.url) {
        window.location.href = stripeData.url;
      }

    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleProcessCheckout}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                <Login />
                
                {/* Truyền props để nhận dữ liệu địa chỉ */}
                <Billing setShippingAddress={setShippingAddress} />
                <Shipping />
                
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <label htmlFor="notes" className="block mb-2.5">Other Notes (optional)</label>
                  <textarea name="notes" id="notes" rows={5} placeholder="Notes about your order..." className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"></textarea>
                </div>
              </div>

              {/* <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Order</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="font-medium text-dark text-right">Subtotal</h4>
                    </div>

                    {/* RENDER DANH SÁCH SẢN PHẨM ĐỘNG */}
                    {cartItems.length === 0 ? (
                      <p className="py-5 text-center text-dark-4">Giỏ hàng trống</p>
                    ) : (
                      cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                          <p className="text-dark">{item.product?.name || 'Sản phẩm'} (x{item.quantity})</p>
                          <p className="text-dark text-right">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      ))
                    )}

                    {/* Hiển thị giảm giá (nếu có) */}
                    {discountRate > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <p className="text-red-500">Discount ({discountRate}%)</p>
                        <p className="text-red-500 text-right">-${discountAmount.toFixed(2)}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Truyền props để áp dụng mã giảm giá */}
                <Coupon setDiscountId={setDiscountId} setDiscountRate={setDiscountRate} />
                <ShippingMethod />
                <PaymentMethod />

                {/* NÚT THANH TOÁN STRIPE */}
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Process to Stripe Checkout'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;