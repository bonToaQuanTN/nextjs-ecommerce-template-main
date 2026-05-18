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
    address: "",
    role: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

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
          address: data.shippingAddress || "",
          role: data.role?.name || "User",
        });
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. HÀM XỬ LÝ LƯUƯ DỮ LIỆU (Dùng chung cho cả Account Details và Address Modal)
  const handleSaveProfile = async (payload: any) => {
    try {
      // Gửi payload lên Backend (Backend dùng UpdateUserDto nhận partial data)
      const res = await axiosInstance.put("/users/profile", payload);
      
      // Cập nhật State ngay lập tức bằng dữ liệu chuẩn nhất từ DB trả về
      setUser(res.data);
      
      alert("Cập nhật thành công!");
      closeAddressModal(); // Đóng modal nếu đang mở
    } catch (error) {
      console.error("Update failed", error.response?.data?.message);
      alert("Cập nhật thất bại: " + (error.response?.data?.message || "Lỗi server"));
    }
  };

  // 3. XỬ LÝ FORM THÔNG TIN TÀI (Account Details Tab)
  const handleAccountDetailsSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Truyền thẳng State hiện tại (vì các input đang dùng onChange để cập nhật State)
    handleSaveProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
  };

  // 4. XỬ LÝ LƯUƯ ĐỊA CHỈ (Được gọi từ Modal)
  const handleSaveAddress = (addressString: string) => {
    // Gộp địa chỉ mới vào object data, giữ lại các thông tin khác không thay đổi
    handleSaveProfile({
      shippingAddress: addressString,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    });
  };

  // 5. XỬ LÝ ĐỔI MẬT KHẨU
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      return alert("Mật khẩu mới không khớp!");
    }
    try {
      await axiosInstance.put("/users/change-password", { 
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      alert("Đổi mật khẩu thành công!");
      setPasswords({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (error) {
      alert("Đổi mật khẩu thất bại!");
    }
  };

  // 6. XỬ LÝ ĐĂNG XUẤT
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/user/logout");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    } catch (error) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  };

  const openAddressModal = () => setAddressModal(true);
  const closeAddressModal = () => setAddressModal(false);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            
            {/* MENU SIDEBAR - Không thay đổi gì ở đây */}
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
                    <button onClick={() => setActiveTab("dashboard")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "dashboard" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}>Dashboard</button>
                    <button onClick={() => setActiveTab("orders")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "orders" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}>Orders</button>
                    <button onClick={() => setActiveTab("addresses")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "addresses" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}>Addresses</button>
                    <button onClick={() => setActiveTab("account-details")} className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${activeTab === "account-details" ? "text-white bg-blue" : "text-dark-2 bg-gray-1"}`}>Account Details</button>
                    
                    <button onClick={handleLogout} className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-red hover:text-white text-dark-2 bg-gray-1">
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="xl:max-w-[770px] w-full">
              
              {/* Dashboard Tab */}
              <div className={`bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${activeTab === "dashboard" ? "block" : "hidden"}`}>
                <p className="text-dark">
                  Hello <strong>{user.firstName} {user.lastName}</strong> (not you? <button onClick={handleLogout} className="text-red hover:underline">Log Out</button>)
                </p>
                <p className="text-custom-sm mt-4">From your account dashboard you can view your recent orders...</p>
              </div>

              {/* Orders Tab */}
              <div className={`bg-white rounded-xl shadow-1 ${activeTab === "orders" ? "block" : "hidden"}`}>
                <Orders />
              </div>

              {/* Addresses Tab */}
              <div className={`flex-col sm:flex-row gap-7.5 ${activeTab === "addresses" ? "flex" : "hidden"}`}>
                <div className="xl:max-w-[370px] w-full bg-white shadow-1 rounded-xl">
                  <div className="flex items-center justify-between py-5 px-4 sm:pl-7.5 sm:pr-6 border-b border-gray-3">
                    <p className="font-medium text-xl text-dark">Shipping Address</p>
                    <button className="text-dark ease-out duration-200 hover:text-blue" onClick={openAddressModal}>{/* SVG Icon Edit ở đây */}</button>
                  </div>
                  <div className="p-4 sm:p-7.5">
                    <div className="flex flex-col gap-4">
                      <p className="flex items-center gap-2.5 text-custom-sm">{/* SVG Icon */} Name: {user.firstName} {user.lastName}</p>
                      <p className="flex items-center gap-2.5 text-custom-sm">{/* SVG Icon */} Email: {user.email}</p>
                      <p className="flex items-center gap-2.5 text-custom-sm">{/* SVG Icon */} Phone: {user.phone || 'Chưa cập nhật'}</p>
                      <p className="flex gap-2.5 text-custom-sm">{/* SVG Icon */} Address: {user.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${activeTab === "account-details" ? "block" : "hidden"}`}>
                <form onSubmit={handleAccountDetailsSubmit}>
                  <div className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                    <p className="text-custom-sm mt-5 mb-9">This will be how your name will be displayed in the account section and in reviews</p>
                    
                    <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                      <div className="w-full">
                        <label htmlFor="firstName" className="block mb-2.5">First Name <span className="text-red">*</span></label>
                        {/* SỬA: Dùng defaultValue để bind state ban đầu, onChange để cập nhật state */}
                        <input type="text" id="firstName" defaultValue={user.firstName} onChange={(e) => setUser({...user, firstName: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20" />
                      </div>

                      <div className="w-full">
                        <label htmlFor="lastName" className="block mb-2.5">Last Name <span className="text-red">*</span></label>
                        <input type="text" id="lastName" defaultValue={user.lastName} onChange={(e) => setUser({...user, lastName: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20" />
                      </div>
                    </div>

                    <button type="submit" className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark">
                      Save Changes
                    </button>
                  </div>
                </form>

                {/* FORM ĐỔI MẬT KHẨU (Tách biệt hẳn để không bị trộn lộn state) */}
                <p className="font-medium text-xl sm:text-2xl text-dark mb-7">Password Change</p>
                <form onSubmit={handleChangePassword} className="bg-white shadow-1 rounded-xl p-4 sm:p-8.5">
                  <div className="mb-5">
                    <label htmlFor="oldPassword" className="block mb-2.5">Old Password</label>
                    <input type="password" required value={passwords.oldPassword} onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20" />
                  </div>
                  <div className="mb-5">
                    <label htmlFor="newPassword" className="block mb-2.5">New Password</label>
                    <input type="password" required value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20" />
                  </div>
                  <div className="mb-5">
                    <label htmlFor="confirmNewPassword" className="block mb-2.5">Confirm New Password</label>
                    <input type="password" required value={passwords.confirmNewPassword} onChange={(e) => setPasswords({...passwords, confirmNewPassword: e.target.value})} className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20" />
                  </div>
                  <button type="submit" className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark">
                    Change Password
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* TRUYỀN DỮ LIỆU VÀ HÀM XỬ LÝ QUA MODAL */}
      {/* SỬA: Truyền hàm `handleSaveAddress` vào Modal */}
      <AddressModal 
        isOpen={addressModal} 
        closeModal={closeAddressModal} 
        initialData={user}
        onSave={handleSaveAddress} // Modal sẽ lấy data từ input và truyền vào đây
      />
    </>
  );
};

export default MyAccount;