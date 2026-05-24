"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useParams, useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const UserEditForm = () => {
  const { id } = useParams(); // Lấy ID từ URL: /admin/users/edit/[id]
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    roleId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch thông tin user hiện tại khi vừa vào trang
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`${API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) throw new Error("Không thể tải thông tin người dùng");
        
        const data = await response.json();
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          designation: data.designation || "",
          roleId: data.roleId || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  // 2. Xử lý thay đổi giá trị input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. Xử lý Submit Form gọi API PUT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      
      // Gọi API PUT /users/:id theo đúng Backend bạn cung cấp
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Bắt buộc vì có @UseGuards(AuthGuard)
        },
        body: JSON.stringify(formData), // Dữ liệu tương ứng với UpdateUserDto
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật thất bại");
      }

      // Thành công thì quay về trang danh sách
      alert("Cập nhật thành công!");
      router.push("/admin/users"); 

    } catch (err) {
      setError(err.message);
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
      <Breadcrumb title={"Chỉnh sửa người dùng"} pages={["Người dùng", "Chỉnh sửa"]} />
      
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[850px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-1 p-8">
            <h2 className="text-2xl font-semibold text-dark mb-8">Cập nhật thông tin</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm">
                Lỗi: {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Họ <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                />
              </div>

              {/* Designation */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Chức danh</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                />
              </div>

              {/* Role ID (Tạm thời dùng input text, sau này nên đổi thành Select Dropdown) */}
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Mã vai trò (Role ID)</label>
                <input
                  type="text"
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleChange}
                  className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            {/* Nút bấm Action */}
            <div className="flex items-center justify-end gap-4 mt-10 pt-6 border-t border-gray-3">
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
                className="py-3 px-8 rounded-md bg-blue text-white hover:bg-opacity-90 ease-out duration-200 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>

        </div>
      </section>
    </>
  );
};

export default UserEditForm;