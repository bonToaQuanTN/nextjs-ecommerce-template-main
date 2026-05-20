"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import axiosInstance from "@/service/api-client";

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressModal, setAddressModal] = useState(false);
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    role: "",
  });

  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/users/profile");
        const data = res.data;
        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          designation: data.designation || "",
          role: data.role?.name || "Guest", 
        });
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  const handleAccountDetailsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.put("/users/profile", {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
      });
      setUser(res.data);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể cập nhật"));
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPassword) return alert("Vui lòng nhập mật khẩu mới");
    
    try {
      await axiosInstance.put("/users/profile", { password: newPassword });
      alert("Đổi mật khẩu thành công!");
      setNewPassword("");
    } catch (error) {
      alert("Lỗi: " + (error.response?.data?.message || "Không thể đổi mật khẩu"));
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/users/logout"); 
    } catch (error) {
      console.error("Logout API error", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    }
  };

  const openAddressModal = () => setAddressModal(true);
  const closeAddressModal = () => setAddressModal(false);

  const handleSaveAddress = async (addressString: string) => {
    alert("Địa chỉ đã được ghi nhận (Lưu ý: Backend cần thêm trường shippingAddress vào UpdateUserDto để lưu vào DB profile)");
    closeAddressModal();
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-dark mb-0.5">{user.firstName} {user.lastName}</p>
                    <p className="text-custom-xs text-blue">{user.role}</p>
                  </div>
                </div>
                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    <button onClick={() => setActiveTab("dashboard")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "dashboard" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}>Cá nhân</button>
                    <button onClick={() => setActiveTab("orders")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "orders" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}>Đơn đặt hàng</button>
                    <button onClick={() => setActiveTab("addresses")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "addresses" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}>Địa chỉ</button>
                    <button onClick={() => setActiveTab("account-details")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "account-details" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}>Chi tiết tài khoản</button>
                    <button onClick={handleLogout} className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-red hover:text-white text-dark-2 bg-gray-1">Đăng xuất</button>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="xl:max-w-[770px] w-full">
              
              {/* Dashboard Tab */}
              <div className={`bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${activeTab === "dashboard" ? "block" : "hidden"}`}>
                <p className="text-dark">Xin chào <strong>{user.firstName} {user.lastName}</strong> (phải bạn đó không? <button onClick={handleLogout} className="text-red hover:underline">Đăng xuất</button>)</p>
                <p className="text-custom-sm mt-4">Từ trang quản lý tài khoản, bạn có thể xem các đơn hàng gần đây, quản lý địa chỉ giao hàng và chỉnh sửa mật khẩu cũng như thông tin tài khoản của mình.</p>
              </div>

              {/* Orders Tab */}
              <div className={`bg-white rounded-xl shadow-1 ${activeTab === "orders" ? "block" : "hidden"}`}>
                <Orders currentUser={user}/>
              </div>

              {/* Addresses Tab */}
              <div className={`flex-col sm:flex-row gap-7.5 ${activeTab === "addresses" ? "flex" : "hidden"}`}>
                <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">
                  <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                    <p className="font-medium text-xl text-dark">Địa chỉ giao hàng</p>
                    <button className="text-dark ease-out duration-200 hover:text-blue font-bold" onClick={openAddressModal}>Chỉnh sửa</button>
                  </div>
                  <div className="p-4 sm:p-7.5">
                    <div className="flex flex-col gap-4">
                      <p className="text-custom-sm">Họ tên: {user.firstName} {user.lastName}</p>
                      <p className="text-custom-sm">Email: {user.email}</p>
                      <p className="text-custom-sm">Số điện thoại: {user.phone || 'Chưa cập nhật'}</p>
                      <p className="text-custom-sm italic">*(Địa chỉ sẽ được nhập lúc đặt hàng)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details Tab */}
              <div className={`${activeTab === "account-details" ? "block" : "hidden"}`}>
                <form onSubmit={handleAccountDetailsSubmit}>
                  <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <p className="text-custom-sm mt-5 mb-9">Thay đổi thông tin tài khoản dưới đây.</p>
                    
                    <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                      <div className="w-full">
                        <label htmlFor="firstName" className="block mb-2.5">Họ <span className="text-red">*</span></label>
                        <input type="text" id="firstName" value={user.firstName} onChange={(e) => setUser({...user, firstName: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" />
                      </div>
                      <div className="w-full">
                        <label htmlFor="lastName" className="block mb-2.5">Tên <span className="text-red">*</span></label>
                        <input type="text" id="lastName" value={user.lastName} onChange={(e) => setUser({...user, lastName: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" />
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                      <div className="w-full">
                        <label htmlFor="email" className="block mb-2.5">Email</label>
                        <input type="email" id="email" value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" />
                      </div>
                      <div className="w-full">
                        <label htmlFor="phone" className="block mb-2.5">Điện thoại</label>
                        <input type="text" id="phone" value={user.phone} onChange={(e) => setUser({...user, phone: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label htmlFor="designation" className="block mb-2.5">Chức vụ</label>
                      <input type="text" id="designation" value={user.designation} onChange={(e) => setUser({...user, designation: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" />
                    </div>

                    <button type="submit" className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark">Save Changes</button>
                  </div>
                </form>

                {/* PASSWORD CHANGE */}
                <p className="font-medium text-xl sm:text-2xl text-dark mb-7 mt-10">Thay đổi mật khẩu</p>
                <form onSubmit={handleChangePassword} className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <div className="mb-5">
                    <label className="block mb-2.5">Mật khẩu mới</label>
                    <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="rounded-md border border-gray-3 bg-gray-1 w-full py-2.5 px-5 outline-none focus:ring-2 focus:ring-blue/20" />
                  </div>
                  <button type="submit" className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark">Change Password</button>
                  <p className="text-xs text-gray-500 mt-2">*(Backend hiện tại không yêu cầu nhập mật khẩu cũ. Nếu muốn bảo mật hơn, hãy sửa Service Backend để yêu cầu oldPassword).</p>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>

      <AddressModal 
        isOpen={addressModal} 
        closeModal={closeAddressModal} 
        initialData={user}
        onSave={handleSaveAddress} 
      />
    </>
  );
};

export default MyAccount;