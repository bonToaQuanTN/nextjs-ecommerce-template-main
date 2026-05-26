"use client"; // Bắt buộc nếu dùng Next.js App Router

import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

// URL Backend của bạn
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const UserPermissionsForm = () => {
  const { id } = useParams(); // Lấy ID user từ URL: /admin/users/permissions/[id]
  const router = useRouter();

  // States
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [assignedPermissions, setAssignedPermissions] = useState([]); // Mảng chứa các permission ID được chọn
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = {
          id: id,
          firstName: "Jhon",
          lastName: "Drineo",
          email: "jhon@admin.com",
          phone: "0909123456",
          designation: "Entroprenor",
          roleId: "role_admin",
          avatar: "/images/users/user-04.jpg"
        };

        const rolesData = [
          { id: "role_admin", name: "Admin" },
          { id: "role_manager", name: "Manager" },
          { id: "role_staff", name: "Staff" }
        ];

        const permissionsData = [
          { id: "perm_1", name: "POST.PRODUCT", description: "Thêm sản phẩm" },
          { id: "perm_2", name: "DELETE.PRODUCT", description: "Xóa sản phẩm" },
          { id: "perm_3", name: "POST.UPLOAD", description: "Upload file" },
          { id: "perm_4", name: "GET.PRODUCT_IMAGE", description: "Xem ảnh sản phẩm" },
          { id: "perm_5", name: "PUT.PRODUCT", description: "Sửa sản phẩm" },
          { id: "perm_6", name: "MANAGE_USERS", description: "Quản lý người dùng" },
        ];
        // -----------------------------------------

        setUser(userData);
        setRoles(rolesData);
        setPermissions(permissionsData);
        setSelectedRole(userData.roleId);
        setAssignedPermissions(["perm_1", "perm_2", "perm_3"]); 

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleRoleChange = (e) => {
    const newRoleId = e.target.value;
    setSelectedRole(newRoleId);
    if(newRoleId === "role_admin") {
      setAssignedPermissions(permissions.map(p => p.id));
    } else {
      setAssignedPermissions(["perm_1", "perm_4"]); // Staff chỉ được xem và thêm
    }
  };

  // Xử lý bật/tắt Permission Checkbox
  const handlePermissionToggle = (permId) => {
    setAssignedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(id => id !== permId) 
        : [...prev, permId]
    );
  };

  // Submit form cập nhật quyền
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      console.log("Đang lưu:", { userId: id, roleId: selectedRole, permissions: assignedPermissions });
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Cập nhật phân quyền thành công!");
      router.push("/blogs/blog-grid"); // Quay lại trang danh sách

    } catch (error) {
      alert("Có lỗi xảy ra khi lưu!");
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
      <Breadcrumb title={"Phân quyền người dùng"} pages={["Người dùng", "Phân quyền"]} />
      
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[850px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-1 overflow-hidden">
            
            {/* Header - Thông tin User (Thay thế cho phần Header Image của Blog) */}
            <div className="bg-gradient-to-r from-blue to-blue-500 p-8 text-white">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/30 bg-gray-2 flex-shrink-0">
                  <Image
                    src={user?.avatar || "/images/users/user-default.jpg"}
                    alt={user?.firstName}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{user?.firstName} {user?.lastName}</h2>
                  <p className="text-white/80 text-sm mt-1">{user?.email} | {user?.designation}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Chọn Vai trò (Role) */}
              <div className="mb-8">
                <label className="block text-dark font-medium text-lg mb-3">Vai trò (Role)</label>
                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  className="w-full bg-gray-2 border border-gray-3 rounded-lg py-3 px-4 text-dark focus:outline-none focus:border-blue"
                >
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <p className="text-gray-400 text-sm mt-2">Khi thay đổi vai trò, các quyền mặc định sẽ được áp dụng bên dưới.</p>
              </div>

              {/* Chọn Quyền chi tiết (Permissions) */}
              <div className="mb-8">
                <h3 className="font-medium text-dark text-lg mb-4">Quy hạn hệ thống (Permissions)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {permissions.map(perm => (
                    <label 
                      key={perm.id} 
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                        assignedPermissions.includes(perm.id) 
                          ? 'bg-blue/5 border-blue text-blue' 
                          : 'bg-white border-gray-3 text-gray-600 hover:border-gray-4'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 rounded border-gray-300 text-blue focus:ring-blue"
                        checked={assignedPermissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                      />
                      <div>
                        <p className="font-medium text-sm">{perm.name}</p>
                        <p className="text-xs text-gray-400">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions - Nút bấm (Thay thế cho phần Tags & Social của Blog) */}
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