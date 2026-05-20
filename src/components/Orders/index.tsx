import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";

const Orders = (currentUser) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (res.status === 401) {
        console.error("Unauthorized");
        return;
      }

      const data = await res.json();
      setOrders(data.data || []); 
    } catch (err) {
      console.log("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, []);

  if (loading) return <div className="p-5">Loading orders...</div>;

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {/* Table Header */}
          <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex">
            <div className="min-w-[111px]"><p className="text-custom-sm text-dark font-medium">Order ID</p></div>
            <div className="min-w-[175px]"><p className="text-custom-sm text-dark font-medium">Date</p></div>
            <div className="min-w-[128px]"><p className="text-custom-sm text-dark font-medium">Status</p></div>
            <div className="min-w-[213px]"><p className="text-custom-sm text-dark font-medium">Customer</p></div>
            <div className="min-w-[113px]"><p className="text-custom-sm text-dark font-medium">Total</p></div>
            <div className="min-w-[113px]"><p className="text-custom-sm text-dark font-medium">Action</p></div>
          </div>
          {orders.length > 0 ? (
            orders.map((orderItem) => (
              <SingleOrder 
                key={orderItem.id}
                orderItem={orderItem} 
                refreshOrders={() => window.location.reload()} 
                currentUser={currentUser}
              />
            ))
          ) : (
            <p className="py-9.5 px-4 sm:px-7.5 text-gray-500">
              You don&apos;t have any orders!
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;