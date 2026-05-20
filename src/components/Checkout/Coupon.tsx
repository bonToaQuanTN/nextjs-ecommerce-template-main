import React, { useState } from "react";

const Coupon = ({ setDiscountId, setDiscountRate }: { setDiscountId: (id: string | null) => void, setDiscountRate: (rate: number) => void }) => {
  const [code, setCode] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!code) return;
    setLoadingCoupon(true);
    
    try {
      const res = await fetch(`/api/discounts?search=${code}`);
      const data = await res.json();
      
      if (data.data && data.data.length > 0) {
        const discount = data.data[0];
        setDiscountId(discount.id);
        setDiscountRate(Number(discount.discountRate));
        alert(`Áp dụng mã giảm giá thành công: Giảm ${discount.discountRate}%`);
      } else {
        alert("Mã giảm giá không hợp lệ");
        setDiscountId(null);
        setDiscountRate(0);
      }
    } catch (error) {
      alert("Lỗi kiểm tra mã giảm giá");
    } finally {
      setLoadingCoupon(false);
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Have any Coupon Code?</h3>
      </div>
      <div className="py-8 px-4 sm:px-8.5">
        <div className="flex gap-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter discount ID or code"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
          <button
            type="button" // Đổi thành button để không trigger submit form
            onClick={handleApplyCoupon}
            disabled={loadingCoupon}
            className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
          >
            {loadingCoupon ? 'Checking...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default Coupon;