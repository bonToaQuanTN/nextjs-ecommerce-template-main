import React from "react";

const OrderDetails = ({ orderItem }) => {
  return (
    <div className="w-full px-10 py-5">
      <h3 className="text-lg font-bold mb-4 text-dark">Order Details</h3>
      
      <div className="space-y-3 text-custom-sm">
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Order ID:</span>
          <span className="font-medium text-dark">#{orderItem.id}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Thời gian:</span>
          <span className="text-dark">{new Date(orderItem.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Trạng thái:</span>
          <span className="capitalize font-medium text-dark">{orderItem.status}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-500">Số Tiền:</span>
          <span className="font-bold text-green">${Number(orderItem.finalAmount || 0).toFixed(2)}</span>
        </div>
        
        {/* Hiển thị địa chỉ thật từ DB */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="font-bold text-dark mb-1">Địa chỉ giao hàng:</p>
          <p className="text-gray-600">
            {orderItem.shippingAddress || "Not provided"}
          </p>
        </div>

        {/* Hiển thị Info User */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="font-bold text-dark mb-1">Thông tin khách hàng:</p>
          <p className="text-gray-600">{orderItem.user?.firstName} {orderItem.user?.lastName}</p>
          <p className="text-gray-600">{orderItem.user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;