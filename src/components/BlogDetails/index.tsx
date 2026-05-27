"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const UserPermissionsForm = () => {
  const { id } = useParams();
  const router = useRouter();

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Quản lý toàn bộ dữ liệu form bằng 1 state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    roleId: "",
  });

  const getAuthHeaders = () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("access_token"); 
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Lấy danh sách Roles
        const rolesRes = await fetch(`${API_URL}/roles`, { headers: getAuthHeaders() });
        if (!rolesRes.ok) throw new Error(`Lỗi tải danh sách vai trò (Mã: ${rolesRes.status})`);
        const rolesData = await rolesRes.json();
        setRoles(rolesData);

        // 2. Lấy thông tin User theo ID
        const userRes = await fetch(`${API_URL}/User/${id}`, { headers: getAuthHeaders() });
        if (!userRes.ok) throw new Error(`Lỗi tải thông tin người dùng (Mã: ${userRes.status})`);
        const userData = await userRes.json();
        
        // Đổ dữ liệu user lấy được vào formData
        setFormData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          designation: userData.designation || "",
          roleId: userData.role?.id || userData.roleId || "",
        });

      } catch (error: any) {
        console.error("Lỗi tải dữ liệu:", error);
        alert(error.message || "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(`${API_URL}/User/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Cập nhật thất bại");
      }

      alert("Cập nhật thông tin và phân quyền thành công!");
      router.push("/blogs/blog-grid");

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra khi lưu!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title={"Chỉnh sửa & Phân quyền"} pages={["Người dùng", "Chỉnh sửa"]} />
      
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[850px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-1 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-blue to-blue-500 p-8 text-white">
              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/20 flex-shrink-0 flex items-center justify-center text-4xl font-bold uppercase">
                  {formData.firstName ? formData.firstName.charAt(0) : "U"}
                </div>
                <div>
                  {/* Hiển thị realtime tên khi đang gõ */}
                  <h2 className="text-2xl font-semibold">{formData.firstName} {formData.lastName}</h2>
                  <p className="text-white/80 text-sm mt-1">{formData.email}</p>
                </div>
              </div>
            </div>

            {/* Thông tin chi tiết (Đã chuyển thành Input) */}
            <div className="p-8 border-b border-gray-3">
              <h3 className="font-medium text-dark text-lg mb-6">Thông tin chi tiết</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                
                <div>
                  <label className="block text-gray-500 text-sm mb-2 font-medium">Họ <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                    placeholder="Nhập họ"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 text-sm mb-2 font-medium">Tên <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                    placeholder="Nhập tên"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 text-sm mb-2 font-medium">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                    placeholder="example@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 text-sm mb-2 font-medium">Số điện thoại</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                    placeholder="0909123456"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-500 text-sm mb-2 font-medium">Chức danh / Địa chỉ</label>
                  <input 
                    type="text" 
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                    placeholder="Nhập chức danh hoặc địa chỉ"
                  />
                </div>

              </div>
            </div>

            {/* Phân quyền Role */}
            <div className="p-8">
              <div className="mb-8">
                <label className="block text-dark font-medium text-lg mb-3">Vai trò (Role)</label>
                <select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                >
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <p className="text-gray-400 text-sm mt-2">
                  Khi gán vai trò mới, toàn bộ quyền (Permissions) của người dùng sẽ được tính theo vai trò này.
                </p>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-3">
                <button 
                  type="button" 
                  onClick={() => router.back()}
                  className="py-3 px-8 rounded-md bg-gray-2 text-dark hover:bg-gray-3 ease-out duration-200"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="py-3 px-8 rounded-md bg-blue text-white hover:bg-opacity-90 ease-out duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang lưu...
                    </>
                  ) : "Lưu thay đổi"}
                </button>
              </div>
            </div>
          </form>

        </div>
      </section>
    </>
  );
};

export default UserPermissionsForm;