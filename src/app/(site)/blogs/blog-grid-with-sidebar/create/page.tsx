"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { 
  productApi, 
  categoryApi, 
  warehouseApi,
  inventoryApi,
  uploadApi, 
  type CreateProductDto, 
  type Category,
  type Warehouse 
} from "@/service/map/inventory/inventory";

const CreateProductPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    price: 0,
    thumbnail: "",
    unit: "cái",
    categoryId: "",
    origin: ""
  });

  const [quantity, setQuantity] = useState<number>(0);
  const [warehouseId, setWarehouseId] = useState<string>("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]); 
  
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [whLoading, setWhLoading] = useState(true); 
  
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allCats, allWhs] = await Promise.all([
          categoryApi.getAllFlatten(),
          warehouseApi.getAllFlatten() 
        ]);
        setCategories(allCats);
        setWarehouses(allWhs);
      } catch (err) {
        console.error("fetchData failed:", err);
      } finally {
        setCatLoading(false);
        setWhLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    try {
      const imageUrl = await uploadApi.uploadFile(file);
      setFormData((prev) => ({ ...prev, thumbnail: imageUrl }));
    } catch (err: any) {
      setUploadError(err.message || "Upload ảnh thất bại.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.thumbnail) {
      setError("Vui lòng đợi ảnh tải lên hoặc chọn ảnh cho sản phẩm.");
      return;
    }

    if (quantity > 0 && !warehouseId) {
      setError("Vui lòng chọn kho hàng nếu bạn nhập số lượng tồn kho.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData };
      if (!payload.categoryId) {
        delete payload.categoryId;
      }
      console.log("Payload Product:", payload);
      const newProduct = await productApi.create(payload);
      const productId = newProduct?.id || newProduct?.data?.id; 
      if (productId && quantity > 0 && warehouseId) {
        const inventoryPayload = {
          productId,
          warehouseId,
          quantity
        };
        console.log("Payload Inventory:", inventoryPayload);
        await inventoryApi.create(inventoryPayload);
      }

      // Thành công thì chuyển hướng
      router.push("/blogs/blog-grid-with-sidebar");
      
    } catch (err: any) {
      console.error("Lỗi khi tạo sản phẩm/tồn kho:", err);
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

              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">Mô tả</label>
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
                  <label className="block text-sm font-medium text-dark mb-1.5">Đơn vị</label>
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

              {/* ── Upload Ảnh ── */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Hình ảnh sản phẩm <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-4">
                  <label className={`cursor-pointer bg-gray-2 text-dark py-2.5 px-4 rounded-md hover:bg-gray-3 text-sm font-medium transition ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? "Đang tải lên..." : "📁 Chọn ảnh"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {formData.thumbnail && !uploading && (
                    <span className="text-xs text-green-600">✓ Đã tải lên thành công</span>
                  )}
                </div>
                
                {uploadError && (
                  <p className="text-red-500 text-xs mt-1">{uploadError}</p>
                )}

                {previewUrl && (
                  <div className="mt-3 relative w-32 h-32 rounded-md overflow-hidden border border-gray-3">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      layout="fill"
                      objectFit="cover"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Xuất xứ sản phẩm */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Xuất xứ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                  placeholder="Nhập xuất xứ (Ví dụ: Việt Nam, Nhật Bản...)"
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"
                />
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Danh mục sản phẩm
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  disabled={catLoading}
                  className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {catLoading ? "Đang tải danh mục..." : "-- Chọn danh mục --"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ SỐ LƯỢNG TỒN KHO & KHO HÀNG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Số lượng tồn kho ban đầu
                  </label>
                  <input
                    type="number"
                    value={quantity || ""}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min="0"
                    placeholder="0"
                    className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Kho hàng nhập vào
                  </label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    disabled={whLoading}
                    className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {whLoading ? "Đang tải kho..." : "-- Chọn kho hàng --"}
                    </option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  disabled={loading || uploading} 
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