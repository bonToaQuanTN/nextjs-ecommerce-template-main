"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";
import {
  productApi,
  inventoryApi,
  warehouseApi,
  type Product,
  type Inventory,
  type Warehouse,
} from "@/service/map/inventory/inventory";

const getTotalStock = (invs: Inventory[]): number =>
  invs.reduce((sum, inv) => sum + inv.quantity, 0);

const ProductDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  // --- Data state ---
  const [product, setProduct] = useState<Product | null>(null);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // --- UI state ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Product Edit State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  const [savingProduct, setSavingProduct] = useState(false);

  // --- ✅ Inventory Edit State ---
  const [editingInvId, setEditingInvId] = useState<string | null>(null); // 'new' hoặc inv.id
  const [editInvData, setEditInvData] = useState<{ warehouseId: string; quantity: number }>({
    warehouseId: "",
    quantity: 0,
  });
  const [savingInv, setSavingInv] = useState(false);

  // ─── Fetch dữ liệu ───
  const fetchData = async () => {
    try {
      const [allInventories, allWarehouses] = await Promise.all([
        inventoryApi.getAllFlatten(),
        warehouseApi.getAllFlatten(),
      ]);

      const productInventories = allInventories.filter(
        (inv) => inv.productId === productId
      );

      setInventories(productInventories);
      setWarehouses(allWarehouses);
    } catch (err) {
      console.error("Fetch inventories failed:", err);
    }
  };

  useEffect(() => {
    if (!productId) return;

    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const productRes = await productApi.getById(productId);
        setProduct(productRes);
        await fetchData();
      } catch (err: any) {
        console.error("Fetch product detail failed:", err);
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, [productId]);

  // ─── Product Handlers ───
  const handleEditClick = () => {
  if (product) {
    setEditFormData({
      name: product.name,
      price: Number(product.price) || 0,
      unit: product.unit,
      origin: product.origin,
      description: product.description,
    });
  }
  setIsEditing(true);
};

  const handleSaveProduct = async (e: React.FormEvent) => {
  e.preventDefault();
  setSavingProduct(true);
  try {
    const payload = {
      ...editFormData,
      price: editFormData.price ? Number(editFormData.price) : product?.price,
    };
    
    const updatedProduct = await productApi.update(productId, payload);
    setProduct(updatedProduct?.data || updatedProduct || product);
    setIsEditing(false);
  } catch (err) {
    console.error("Update product failed:", err);
  } finally {
    setSavingProduct(false);
  }
};

  // ─── ✅ Inventory Handlers ───
  const handleAddNewInv = () => {
    setEditingInvId("new");
    setEditInvData({ warehouseId: "", quantity: 0 });
  };

  const handleEditInv = (inv: Inventory) => {
    setEditingInvId(inv.id);
    setEditInvData({ warehouseId: inv.warehouseId, quantity: inv.quantity });
  };

  const handleCancelInv = () => {
    setEditingInvId(null);
  };

  const handleSaveInv = async () => {
    if (!editInvData.warehouseId) {
      alert("Vui lòng chọn kho hàng");
      return;
    }
    setSavingInv(true);
    try {
      if (editingInvId === "new") {
        // Gọi API tạo mới inventory
        await inventoryApi.create({
          productId: productId,
          warehouseId: editInvData.warehouseId,
          quantity: editInvData.quantity,
        });
      } else {
        // Gọi API cập nhật inventory
        await inventoryApi.update(editingInvId, editInvData);
      }
      setEditingInvId(null);
      await fetchData(); // Refresh lại bảng tồn kho
    } catch (err: any) {
      alert(err.message || "Lưu tồn kho thất bại");
    } finally {
      setSavingInv(false);
    }
  };

  // ─── Helpers ───
  const getWarehouseName = (whId: string) =>
    warehouses.find((wh) => wh.id === whId)?.name || "Không xác định";

  const getWarehouseAddress = (whId: string) =>
    warehouses.find((wh) => wh.id === whId)?.address || "";

  // ─── Loading & Error UI ───
  if (loading) {
    return (
      // ... Giữ nguyên JSX loading cũ
      <>
        <Breadcrumb title={"Chi tiết sản phẩm"} pages={["Dashboard", "Sản phẩm", "Chi tiết"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !product) {
    return (
      // ... Giữ nguyên JSX error cũ
      <>
        <Breadcrumb title={"Lỗi"} pages={["Dashboard", "Sản phẩm", "Lỗi"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 flex items-center justify-center min-h-[400px]">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
              <p className="text-red-600 mb-4">{error || "Không tìm thấy sản phẩm."}</p>
              <button onClick={() => router.back()} className="bg-blue text-white py-2 px-6 rounded-md hover:bg-opacity-90">
                Quay lại
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  const totalStock = getTotalStock(inventories);

  return (
    <>
      <Breadcrumb title={product.name} pages={["Dashboard", "Sản phẩm", product.name]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => router.back()} className="text-dark hover:text-blue transition flex items-center gap-2">
              ← Quay lại danh sách
            </button>
            {!isEditing ? (
              <button onClick={handleEditClick} className="bg-blue text-white py-2 px-5 rounded-md hover:bg-opacity-90 transition">
                ✏️ Chỉnh sửa thông tin SP
              </button>
            ) : (
              <button onClick={() => setIsEditing(false)} className="bg-gray-2 text-dark py-2 px-5 rounded-md hover:bg-gray-3 transition">
                Hủy bỏ
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-7.5">
            {/* ── Cột trái: Ảnh & Mô tả ── */}
            {/* ... Giữ nguyên cột trái của bạn ... */}
            <div className="lg:max-w-[500px] w-full">
              <div className="bg-white rounded-xl shadow-1 overflow-hidden">
                <div className="relative w-full h-[400px]">
                  <Image src={product.thumbnail || "/images/products/default.jpg"} alt={product.name} layout="fill" objectFit="cover" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-1 p-6 mt-7.5">
                <h3 className="text-lg font-semibold text-dark mb-3">Mô tả sản phẩm</h3>
                {isEditing ? (
                  <textarea name="description" value={editFormData.description || ""} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} rows={5} className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue resize-none"/>
                ) : (
                  <p className="text-gray-500 text-sm leading-relaxed">{product.description || "Chưa có mô tả."}</p>
                )}
              </div>
            </div>

            {/* ── Cột phải: Thông tin & Tồn kho ── */}
            <div className="flex-1">
              <form onSubmit={handleSaveProduct} className="bg-white rounded-xl shadow-1 p-6">
                {isEditing ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1.5">Tên sản phẩm</label>
                      <input type="text" name="name" value={editFormData.name || ""} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-lg font-bold focus:outline-none focus:border-blue"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1.5">Giá bán ($)</label>
                        <input type="number" name="price" value={editFormData.price || 0} onChange={(e) => setEditFormData({...editFormData, price: Number(e.target.value)})} min="0" className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1.5">Đơn vị</label>
                        <input type="text" name="unit" value={editFormData.unit || ""} onChange={(e) => setEditFormData({...editFormData, unit: e.target.value})} className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1.5">Xuất xứ</label>
                      <input type="text" name="origin" value={editFormData.origin || ""} onChange={(e) => setEditFormData({...editFormData, origin: e.target.value})} className="w-full border border-gray-3 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue"/>
                    </div>
                    <button type="submit" disabled={savingProduct} className="mt-2 w-full bg-blue text-white py-2.5 rounded-md hover:bg-opacity-90 disabled:opacity-50 transition">
                      {savingProduct ? "Đang lưu..." : "Lưu thay đổi thông tin"}
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-dark mb-4">{product.name}</h2>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-400">Giá bán</p>
                        <p className="text-xl font-bold text-blue">${product.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Đơn vị</p>
                        <p className="text-base font-medium text-dark">{product.unit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Xuất xứ</p>
                        <p className="text-base font-medium text-dark">{product.origin || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Tổng tồn kho</p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${totalStock > 20 ? "bg-green-100 text-green-600" : totalStock > 0 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}`}>
                          {totalStock} {product.unit}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </form>

              {/* ✅ BẢNG TỒN KHO ĐÃ NÂNG CẤP */}
              <div className="bg-white rounded-xl shadow-1 p-6 mt-7.5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-dark">Chi tiết tồn kho theo kho</h3>
                  {editingInvId !== "new" && (
                    <button onClick={handleAddNewInv} className="text-sm bg-gray-2 text-dark py-1.5 px-3 rounded-md hover:bg-gray-3">
                      + Thêm vào kho
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-3">
                        <th className="pb-3 text-sm font-semibold text-dark">Kho hàng</th>
                        <th className="pb-3 text-sm font-semibold text-dark">Địa chỉ</th>
                        <th className="pb-3 text-sm font-semibold text-dark text-right">Số lượng</th>
                        <th className="pb-3 text-sm font-semibold text-dark text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Dòng thêm mới */}
                      {editingInvId === "new" && (
                        <tr className="border-b border-gray-3 bg-blue/5">
                          <td className="py-3 pr-2">
                            <select
                              value={editInvData.warehouseId}
                              onChange={(e) => setEditInvData({ ...editInvData, warehouseId: e.target.value })}
                              className="w-full border border-gray-3 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue bg-white"
                            >
                              <option value="">-- Chọn kho --</option>
                              {warehouses.map((wh) => (
                                <option key={wh.id} value={wh.id}>{wh.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3 text-sm text-gray-400 italic">Kho mới</td>
                          <td className="py-3 pr-2">
                            <input
                              type="number"
                              min="0"
                              value={editInvData.quantity}
                              onChange={(e) => setEditInvData({ ...editInvData, quantity: Number(e.target.value) })}
                              className="w-full border border-gray-3 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:border-blue"
                            />
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button onClick={handleSaveInv} disabled={savingInv} className="text-white bg-blue px-2 py-1 rounded text-xs hover:bg-opacity-90 disabled:opacity-50">
                              {savingInv ? "..." : "Lưu"}
                            </button>
                            <button onClick={handleCancelInv} className="text-gray-500 hover:text-red-500 px-2 py-1 text-xs">
                              Hủy
                            </button>
                          </td>
                        </tr>
                      )}

                      {/* Dòng dữ liệu cũ */}
                      {inventories.length === 0 && editingInvId !== "new" ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400 border border-dashed border-gray-3 rounded-lg">
                            Chưa có dữ liệu tồn kho.
                          </td>
                        </tr>
                      ) : (
                        inventories.map((inv) => (
                          <tr key={inv.id} className="border-b border-gray-3 last:border-0">
                            {editingInvId === inv.id ? (
                              <>
                                <td className="py-3 pr-2">
                                  <select
                                    value={editInvData.warehouseId}
                                    onChange={(e) => setEditInvData({ ...editInvData, warehouseId: e.target.value })}
                                    className="w-full border border-gray-3 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue bg-white"
                                  >
                                    <option value="">-- Chọn kho --</option>
                                    {warehouses.map((wh) => (
                                      <option key={wh.id} value={wh.id}>{wh.name}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-3 text-sm text-gray-500 truncate max-w-[150px]">
                                  {getWarehouseAddress(editInvData.warehouseId)}
                                </td>
                                <td className="py-3 pr-2">
                                  <input
                                    type="number"
                                    min="0"
                                    value={editInvData.quantity}
                                    onChange={(e) => setEditInvData({ ...editInvData, quantity: Number(e.target.value) })}
                                    className="w-full border border-gray-3 rounded px-2 py-1.5 text-sm text-right focus:outline-none focus:border-blue"
                                  />
                                </td>
                                <td className="py-3 text-right space-x-2">
                                  <button onClick={handleSaveInv} disabled={savingInv} className="text-white bg-blue px-2 py-1 rounded text-xs hover:bg-opacity-90 disabled:opacity-50">
                                    {savingInv ? "..." : "Lưu"}
                                  </button>
                                  <button onClick={handleCancelInv} className="text-gray-500 hover:text-red-500 px-2 py-1 text-xs">
                                    Hủy
                                  </button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 text-sm text-dark">{getWarehouseName(inv.warehouseId)}</td>
                                <td className="py-3 text-sm text-gray-500 max-w-[200px] truncate">{getWarehouseAddress(inv.warehouseId)}</td>
                                <td className="py-3 text-sm text-dark font-medium text-right">{inv.quantity} {product.unit}</td>
                                <td className="py-3 text-right">
                                  <button onClick={() => handleEditInv(inv)} className="text-gray-400 hover:text-blue text-sm">
                                     Sửa
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailPage;