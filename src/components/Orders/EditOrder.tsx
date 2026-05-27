import React, { useState } from "react";
import toast from "react-hot-toast";

const EditOrder = ({ order, toggleModal, refreshOrders }) => {
  const [currentStatus, setCurrentStatus] = useState(order?.status || "PENDING");
  const [isLoading, setIsLoading] = useState(false);
  const isLocked = order?.status === "PAID";

  const handleChanege = (e) => {
    setCurrentStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return; 

    if (!currentStatus) {
      toast.error("Please select a status");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: currentStatus })
      });

      if (res.ok) {
        toast.success("Order status updated successfully!");
        toggleModal(false);
        if (refreshOrders) refreshOrders(); 
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-10 py-5">
      <h3 className="text-lg font-bold mb-4 text-dark">Trạng thái đơn hàng</h3>
      
      {isLocked && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg">
          Đơn hàng đã thanh toán (PAID) nên không thể thay đổi trạng thái.
        </div>
      )}

      <div className="w-full">
        <select
          className="w-full rounded-[10px] border border-gray-3 bg-gray-1 text-dark py-3.5 px-5 text-custom-sm disabled:cursor-not-allowed disabled:opacity-60"
          name="status"
          id="status"
          value={currentStatus}
          onChange={handleChanege}
          disabled={isLocked} 
        >
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button
          className="mt-5 w-full rounded-[10px] border border-blue-1 bg-blue-1 text-white py-3.5 px-5 text-custom-sm bg-blue disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={isLoading || isLocked}
        >
          {isLoading ? "Saving..." : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
};

export default EditOrder;