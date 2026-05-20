import React, { useState } from "react";
import toast from "react-hot-toast";

const EditOrder = ({ order, toggleModal, refreshOrders }) => {
  const [currentStatus, setCurrentStatus] = useState(order?.status || "PENDING");
  const [isLoading, setIsLoading] = useState(false);

  const handleChanege = (e) => {
    setCurrentStatus(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <h3 className="text-lg font-bold mb-4 text-dark">Update Order Status</h3>
      <div className="w-full">
        <select
          className="w-full rounded-[10px] border border-gray-3 bg-gray-1 text-dark py-3.5 px-5 text-custom-sm"
          name="status"
          id="status"
          value={currentStatus}
          onChange={handleChanege}
        >
          {/* Các giá trị này PHẢI khớp với logic Backend của bạn */}
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="PAID">Paid / Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <button
          className="mt-5 w-full rounded-[10px] border border-blue-1 bg-blue-1 text-white py-3.5 px-5 text-custom-sm bg-blue disabled:opacity-50"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditOrder;