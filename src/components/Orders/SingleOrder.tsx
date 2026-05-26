import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });
};

const SingleOrder = ({ orderItem, refreshOrders, currentUser }) =>{
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const toggleDetails = () => setShowDetails(!showDetails);
  const toggleEdit = () => setShowEdit(!showEdit);
  const toggleModal = (status) => { setShowDetails(status); setShowEdit(status); };
  const getStatusClass = (status) => {
    const lowerStatus = status?.toLowerCase();
    if (lowerStatus === "paid" || lowerStatus === "delivered") return "text-green bg-green-light-6";
    if (lowerStatus === "cancelled") return "text-red bg-red-light-6";
    if (lowerStatus === "pending") return "text-yellow bg-yellow-light-4";
    return "text-gray-500 bg-gray-100";
  };

  return (
    <>
      <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
        <div className="min-w-[111px]">
          <p className="text-custom-sm text-red">#{orderItem.id?.slice(0, 8)}</p>
        </div>
        <div className="min-w-[175px]">
          <p className="text-custom-sm text-dark">{formatDate(orderItem.createdAt)}</p>
        </div>
        <div className="min-w-[128px]">
          <p className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${getStatusClass(orderItem.status)}`}>
            {orderItem.status}
          </p>
        </div>
        
        <div className="min-w-[213px]">
          <p className="text-custom-sm text-dark">
            {orderItem.user?.firstName} {orderItem.user?.lastName}
          </p>
        </div>

        <div className="min-w-[113px]">
          <p className="text-custom-sm text-dark font-medium">
            ${Number(orderItem.finalAmount || 0).toFixed(2)}
          </p>
        </div>
        
        <div className="flex gap-5 items-center">
          <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden border-t border-gray-3 py-4.5 px-7.5">
         <p className="text-custom-sm text-dark"><span className="font-bold pr-2">Order:</span> #{orderItem.id?.slice(0, 8)}</p>
         <p className="text-custom-sm text-dark"><span className="font-bold pr-2">Date:</span> {formatDate(orderItem.createdAt)}</p>
         <p className="text-custom-sm text-dark">
            <span className="font-bold pr-2">Status:</span>{" "}
            <span className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${getStatusClass(orderItem.status)}`}>
              {orderItem.status}
            </span>
         </p>
         <p className="text-custom-sm text-dark"><span className="font-bold pr-2">Customer:</span> {orderItem.user?.firstName} {orderItem.user?.lastName}</p>
         <p className="text-custom-sm text-dark"><span className="font-bold pr-2">Total:</span> ${Number(orderItem.finalAmount || 0).toFixed(2)}</p>
         
         <div className="mt-2">
            <OrderActions toggleDetails={toggleDetails} toggleEdit={toggleEdit} />
         </div>
      </div>

      <OrderModal 
        showDetails={showDetails} 
        showEdit={showEdit} 
        toggleModal={toggleModal} 
        order={orderItem}
        refreshOrders={refreshOrders}
      />
    </>
  );
};

export default SingleOrder;