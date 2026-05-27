import React from "react";
import OrderDetails from "./OrderDetails";
import EditOrder from "./EditOrder";

const OrderModal = ({ showDetails, showEdit, toggleModal, order, refreshOrders }) => {
  if (!showDetails && !showEdit) return null;

  return (
    <div className="backdrop-filter-sm visible fixed left-0 top-0 z-[99999] flex min-h-screen w-full justify-center items-center bg-[#000]/40 px-4 py-8">
      {/* Tăng chiều cao modal (h-[242px] -> min-h-[300px]) để không bị tràn nội dung mới */}
      <div className="shadow-7 relative w-full max-w-[600px] min-h-[300px] transform rounded-[15px] bg-white transition-all p-0 overflow-hidden">
        <button
          onClick={() => toggleModal(false)}
          className="text-body absolute right-4 top-4 z-[9999] flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {showDetails && <OrderDetails orderItem={order} />}
        {showEdit && <EditOrder order={order} toggleModal={toggleModal} refreshOrders={refreshOrders} />}
      </div>
    </div>
  );
};

export default OrderModal;