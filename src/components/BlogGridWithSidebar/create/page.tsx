"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { productApi, type CreateProductDto } from "@/service/map/inventory/inventory";

const CreateProductPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    price: 0,
    thumbnail: "",
    unit: "cái",
    categoryId: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await productApi.create(formData);
      // Thành công thì quay về trang danh sách sản phẩm
      router.push("/admin/products"); // Đổi path nếu route Dashboard của bạn khác
    } catch (err: any) {
      setError(err.message || "Không thể tạo sản phẩm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Thêm sản phẩm mới"} pages={["Dashboard", "Sản phẩm", "Thêm mới"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[800px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-dark mb-6">Thông tin sản phẩm</h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên sản phẩm..."
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Mô tả ngắn về sản phẩm..."
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue resize-none"
                />
              </div>

              {/* Giá & Đơn vị */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Giá ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ""}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0.00"
                    className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Đơn vị
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    placeholder="cái, kg, hộp..."
                    className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
              </div>

              {/* Ảnh thumbnail */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  URL Hình ảnh
                </label>
                <input
                  type="text"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"
                />
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  ID Danh mục
                </label>
                <input
                  type="text"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  placeholder="UUID của danh mục (nếu có)"
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 border border-gray-3 rounded-md text-dark hover:bg-gray-2 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {loading ? "Đang xử lý..." : "Tạo sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreateProductPage;