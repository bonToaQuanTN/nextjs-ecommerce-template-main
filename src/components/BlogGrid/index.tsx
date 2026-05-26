"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { mockUsers } from "@/service/map/mockdata/mockdata"; // Giữ lại để fallback nếu chưa có token

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const UserManagement = () => {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Hàm gọi API
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

      if (!token) {
        throw new Error("Chưa đăng nhập hoặc thiếu Token xác thực.");
      }
      const response = await fetch(`${API_URL}/User?page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error("Bạn không có quyền xem danh sách người dùng (thiếu GET.USER).");
        throw new Error(`Lỗi HTTP: ${response.status}`);
      }

      const result = await response.json();
      if (result.data && result.meta) {
        setUsers(result.data);
        setTotalPages(result.meta.lastPage || result.meta.totalPages || 1);
      } else if (Array.isArray(result)) {
        setUsers(result);
        setTotalPages(1);
      } else {
        setUsers(result.items || result.users || []);
        setTotalPages(result.totalPages || 1);
      }
      
    } catch (err) {
      console.error("Failed to fetch users:", err.message);
      setError(err.message);
      setUsers(mockUsers);
      
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers(currentPage);
  }, []);

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchUsers(newPage);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title={"Quản lý Người dùng"} pages={["Users"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold text-dark">
              Thành viên hệ thống
            </h3>
            <button 
              onClick={() => router.push("/admin/users/create")}
              className="bg-blue text-white py-2 px-5 rounded-md hover:bg-opacity-90"
            >
              Thêm người dùng
            </button>
          </div>

          {error && (
             <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm border border-red-200">
               Lỗi: {error} (Đang hiển thị dữ liệu mẫu)
             </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
            {users.map((user) => (
              <div key={user.id} className="bg-white shadow-1 rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue to-blue-500 h-24 relative">
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-2 overflow-hidden relative">
                      <Image
                        src={user.avatar || user.thumbnail || "/images/users/user-default.jpg"}
                        alt={user.firstName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-14 pb-6 px-5 text-center">
                  <h4 className="font-medium text-dark text-xl mb-1">
                    {user.firstName} {user.lastName}
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">{user.designation || "Chức danh"}</p>

                  <div className="border-t border-gray-3 pt-4 space-y-2 text-left">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500">📧</span>
                      <span className="text-dark truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500">📱</span>
                      <span className="text-dark">{user.phone || "Chưa cập nhật"}</span>
                    </div>
                    {user.role && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">🔑</span>
                        <span className="text-dark font-medium">{user.role.name || user.roleId}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button onClick={() => router.push(`/blogs/blog-details/${user.id}`)}
                      className="flex-1 bg-gray-2 text-dark py-2 rounded-md text-sm hover:bg-gray-3">
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <div className="bg-white shadow-1 rounded-md p-2 flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-md text-sm hover:bg-gray-2 disabled:text-gray-4 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3.5 py-1.5 rounded-md text-sm duration-200 ${
                      currentPage === pageNum 
                        ? 'bg-blue text-white' 
                        : 'hover:bg-gray-2 text-dark'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-md text-sm hover:bg-gray-2 disabled:text-gray-4 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
};

export default UserManagement;