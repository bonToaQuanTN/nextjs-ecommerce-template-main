import React, { useState } from "react";
import { useAppSelector } from "@/redux/store";
import { useRouter } from "next/navigation";
import { selectTotalPrice } from "@/redux/features/cartItem-slide";
import { getToken } from "@/service/map/lib/token";

// ✅ 1. Khai báo nhận prop address
const OrderSummary = ({ address }: { address: string }) => {
  const cartItems = useAppSelector((state) => state.cart?.cartItems || []);
  const totalPrice = useAppSelector(selectTotalPrice);

  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // ✅ 2. Kiểm tra xem người dùng đã nhập địa chỉ chưa
    if (!address.trim()) {
      alert("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }
    
    try {
      setIsProcessing(true);
      const token = getToken();
      
      if (!token) {
        alert("Vui lòng đăng nhập trước khi thanh toán!");
        router.push('/signin');
        return;
      }

      const orderRes = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          // ✅ 3. Truyền biến address thật vào đây
          shippingAddress: address, 
          discountId: null 
        })
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.message || "Lỗi khi tạo đơn hàng (Có thể sản phẩm đã hết hàng)");
      }

      const orderData = await orderRes.json();
      const realOrderId = orderData?.id || orderData?.data?.id;

      if (!realOrderId) {
        throw new Error("Không lấy được ID đơn hàng từ server");
      }

      const stripeRes = await fetch('/api/stripe/checkout', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: realOrderId }) 
      });

      if (!stripeRes.ok) {
        const errText = await stripeRes.text();
        throw new Error(`Lỗi khi kết nối cổng thanh toán: ${errText}`);
      }

      const stripeData = await stripeRes.json();
      const checkoutUrl = stripeData?.url || stripeData?.data?.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Không nhận được link thanh toán từ Stripe");
      }
      
    } catch (error: any) {
      console.error("Lỗi checkout:", error);
      alert(error.message || "Có lỗi xảy ra khi tiến hành thanh toán!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="lg:max-w-[455px] w-full">
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-dark">Tóm tắt</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          <div className="flex items-center justify-between py-5 border-b border-gray-3">
            <h4 className="font-medium text-dark">Sản phẩm</h4>
            <h4 className="font-medium text-dark text-right">Tạm tính</h4>
          </div>

          {cartItems.map((item, key) => {
            const currentPrice = Number(item.discountedPrice ?? item.price ?? 0);
            const quantity = Number(item.quantity || 1);
            
            return (
              <div key={key} className="flex items-center justify-between py-5 border-b border-gray-3">
                <div>
                  <p className="text-dark">{item.title}</p>
                </div>
                <div>
                  <p className="text-dark text-right">
                    ${(currentPrice * quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="font-medium text-lg text-dark">Tổng cộng</p>
            </div>
            <div>
              <p className="font-medium text-lg text-dark text-right">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCheckout}
            disabled={isProcessing || cartItems.length === 0}
            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Đang xử lý..." : "Tiến hành thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;