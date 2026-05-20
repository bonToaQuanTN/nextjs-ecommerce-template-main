"use client";
import React, { useState, useEffect } from "react";

const AddressModal = ({ isOpen, closeModal, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: `${initialData.firstName || ""} ${initialData.lastName || ""}`.trim(),
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
      });
    }
  }, [isOpen, initialData]);

  // Đóng modal khi click ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closeModal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData.address); 
  };

  return (
    <div className={`fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5 ${isOpen ? "block z-99999" : "hidden"}`}>
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button onClick={closeModal} className="absolute top-0 right-0 sm:top-3 sm:right-3 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark">✕</button>
          
          <div className="mt-10">
            <form onSubmit={handleSubmit}>
              {/* Dùng value và onChange để bind state */}
              <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                <div className="w-full">
                  <label className="block mb-2.5">Tên</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" readOnly />
                </div>
                <div className="w-full">
                  <label className="block mb-2.5">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}   className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" readOnly />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                <div className="w-full">
                  <label className="block mb-2.5">Số điện thoại</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" readOnly />
                </div>
                <div className="w-full">
                  <label className="block mb-2.5">Địa chỉ giao hàng mới</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" placeholder="Nhập địa chỉ mới..." autoFocus />
                </div>
              </div>

              <button type="submit" className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark">Save Address</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressModal;