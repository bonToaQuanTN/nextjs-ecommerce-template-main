"use client";

import React, { useEffect, useState, useCallback } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import {  productApi,  inventoryApi,  warehouseApi,  categoryApi,  type Product,  type Inventory,  type Warehouse,  type Category,} from "@/service/map/inventory/inventory";

// ─── Helpers ───
const getTotalStock = (productId: string, inventories: Inventory[]): number =>
  inventories
    .filter((inv) => inv.productId === productId)
    .reduce((sum, inv) => sum + inv.quantity, 0);

// ─── Component ───
const InventoryDashboard = () => {
  // --- Data state ---
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // --- UI state ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Pagination ---
  const [productPage, setProductPage] = useState(1);
  const [productLastPage, setProductLastPage] = useState(1);

  // --- Search ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // ─── Fetchers ───
  const fetchProducts = useCallback(async (page: number, search?: string) => {
    try {
      const res = search?.trim()
        ? await productApi.search(search, page)
        : await productApi.getAll(page);

      setProducts(res.data || []);
      setProductLastPage(res.lastPage || 1);
    } catch (err) {
      console.error("fetchProducts failed:", err);
      throw err;
    }
  }, []);

  const fetchInventories = useCallback(async () => {
    try {
      const all = await inventoryApi.getAllFlatten();
      setInventories(all);
    } catch (err) {
      console.error("fetchInventories failed:", err);
      // Non-critical: stock will show 0
      setInventories([]);
    }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    try {
      const all = await warehouseApi.getAllFlatten();
      setWarehouses(all);
    } catch (err) {
      console.error("fetchWarehouses failed:", err);
      setWarehouses([]);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const all = await categoryApi.getAllFlatten();
      setCategories(all);
    } catch (err) {
      console.error("fetchCategories failed:", err);
      setCategories([]);
    }
  }, []);

  // ─── Initial load ───
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchProducts(1),
          fetchInventories(),
          fetchWarehouses(),
          fetchCategories(),
        ]);
      } catch {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [fetchProducts, fetchInventories, fetchWarehouses, fetchCategories]);

  // ─── Page change ───
  const handlePageChange = async (newPage: number) => {
    setProductPage(newPage);
    try {
      await fetchProducts(newPage, activeSearch);
    } catch {
      setError("Không thể tải trang.");
    }
  };

  // ─── Search ───
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
    setProductPage(1);
    try {
      await fetchProducts(1, searchQuery);
    } catch {
      setError("Tìm kiếm thất bại.");
    }
  };

  const handleClearSearch = async () => {
    setSearchQuery("");
    setActiveSearch("");
    setProductPage(1);
    try {
      await fetchProducts(1);
    } catch {
      setError("Không thể tải sản phẩm.");
    }
  };

  // ─── Loading / Error ───
  if (loading) {
    return (
      <>
        <Breadcrumb
          title={"Quản lý Kho & Sản phẩm"}
          pages={["Dashboard", "Sản phẩm"]}
        />
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

  if (error) {
    return (
      <>
        <Breadcrumb
          title={"Quản lý Kho & Sản phẩm"}
          pages={["Dashboard", "Sản phẩm"]}
        />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 flex items-center justify-center min-h-[400px]">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue text-white py-2 px-6 rounded-md hover:bg-opacity-90"
              >
                Thử lại
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb
        title={"Quản lý Kho & Sản phẩm"}
        pages={["Dashboard", "Sản phẩm"]}
      />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5">
            {/* ── Product Grid ── */}
            <div className="lg:max-w-[770px] w-full">
              {/* Header + Search */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-semibold text-dark">
                  Danh sách sản phẩm
                </h3>
                <div className="flex items-center gap-3">
                  {/* Search bar */}
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm sản phẩm..."
                      className="border border-gray-3 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue"
                    />
                    <button
                      type="submit"
                      className="bg-gray-2 text-dark py-2 px-3 rounded-md hover:bg-gray-3 text-sm"
                    >
                      🔍
                    </button>
                    {activeSearch && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="text-gray-400 hover:text-red-500 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </form>
                  <button className="bg-blue text-white py-2 px-4 rounded-md hover:bg-opacity-90">
                    + Thêm sản phẩm
                  </button>
                </div>
              </div>

              {activeSearch && (
                <p className="text-sm text-gray-500 mb-4">
                  Kết quả tìm kiếm cho:{" "}
                  <span className="font-medium text-dark">
                    &ldquo;{activeSearch}&rdquo;
                  </span>
                </p>
              )}

              {/* Product Cards */}
              {products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-1 p-10 text-center">
                  <p className="text-gray-400 text-lg">Không tìm thấy sản phẩm nào.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-7.5">
                  {products.map((product) => {
                    const totalStock = getTotalStock(product.id, inventories);

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-1 overflow-hidden group"
                      >
                        <div className="relative w-full h-60 overflow-hidden">
                          <Image
                            src={product.thumbnail || "/images/products/default.jpg"}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                            className="group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-5">
                          <h4 className="font-medium text-dark text-lg mb-2 hover:text-blue">
                            <Link href={`/admin/products/${product.id}`}>
                              {product.name}
                            </Link>
                          </h4>
                          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-blue font-bold text-xl">
                              ${product.price}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                totalStock > 20
                                  ? "bg-green-100 text-green-600"
                                  : totalStock > 0
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              Còn hàng: {totalStock} {product.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {productLastPage > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => handlePageChange(productPage - 1)}
                    disabled={productPage <= 1}
                    className="px-4 py-2 rounded-md border border-gray-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-2"
                  >
                    ← Trước
                  </button>

                  {Array.from({ length: productLastPage }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === productLastPage ||
                        Math.abs(p - productPage) <= 1
                    )
                    .reduce<(number | string)[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      typeof item === "string" ? (
                        <span key={`dots-${idx}`} className="px-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item)}
                          className={`px-3 py-2 rounded-md text-sm ${
                            item === productPage
                              ? "bg-blue text-white"
                              : "border border-gray-3 hover:bg-gray-2"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => handlePageChange(productPage + 1)}
                    disabled={productPage >= productLastPage}
                    className="px-4 py-2 rounded-md border border-gray-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-2"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="lg:max-w-[370px] w-full">
              {/* Warehouse Box */}
              <div className="shadow-1 bg-white rounded-xl">
                <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
                  <h2 className="font-medium text-lg text-dark">Kho hàng</h2>
                </div>
                <div className="p-4 sm:p-6">
                  {warehouses.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Không có kho hàng nào.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {warehouses.map((wh) => (
                        <button
                          key={wh.id}
                          className="group flex items-center justify-between ease-out duration-200 text-dark hover:text-blue text-left"
                        >
                          {wh.name}
                          <span className="text-xs text-gray-4 ml-2 truncate max-w-[150px]">
                            {wh.address}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Box */}
              <div className="shadow-1 bg-white rounded-xl mt-7.5">
                <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
                  <h2 className="font-medium text-lg text-dark">
                    Danh mục sản phẩm
                  </h2>
                </div>
                <div className="p-4 sm:p-6">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      Không có danh mục nào.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          className="group flex items-center justify-between ease-out duration-200 text-dark hover:text-blue"
                        >
                          {cat.name}
                          {cat.products !== undefined && (
                            <span className="inline-flex rounded-[30px] bg-gray-2 text-custom-xs px-1.5 ease-out duration-200 group-hover:text-white group-hover:bg-blue">
                              {cat.products}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default InventoryDashboard;