"use client";

import React, { useEffect, useState, useCallback } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import {
  productApi,
  inventoryApi,
  warehouseApi,
  categoryApi,
  type Product,
  type Inventory,
  type Warehouse,
  type Category,
} from "@/service/map/inventory/inventory";

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
  const [loading, setLoading] = useState(true); // Loading toàn trang (lúc reset/lọc)
  const [loadingMore, setLoadingMore] = useState(false); // Loading nhỏ (lúc bấm xem thêm)
  const [error, setError] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // --- Pagination ---
  const [productPage, setProductPage] = useState(1);
  const [productLastPage, setProductLastPage] = useState(1);

  // --- Search ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // --- Category filter ---
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  // ─── Fetchers (Đổi thành trả về dữ liệu để dễ xử lý Cộng dồn/Thay thế) ───
  const fetchProducts = useCallback(async (page: number, search?: string) => {
    const res = search?.trim()
      ? await productApi.search(search, page)
      : await productApi.getAll(page);
    return res;
  }, []);

  const fetchInventories = useCallback(async () => {
    const all = await inventoryApi.getAllFlatten();
    return all;
  }, []);

  const fetchWarehouses = useCallback(async () => {
    const all = await warehouseApi.getAllFlatten();
    return all;
  }, []);

  const fetchCategories = useCallback(async () => {
    const all = await categoryApi.getAllFlatten();
    return all;
  }, []);

  // ─── Initial load ───
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, invRes, whRes, catRes] = await Promise.all([
          fetchProducts(1),
          fetchInventories(),
          fetchWarehouses(),
          fetchCategories(),
        ]);
        
        setProducts(prodRes.data || []);
        setProductLastPage(prodRes.lastPage || 1);
        setInventories(invRes);
        setWarehouses(whRes);
        setCategories(catRes);
      } catch {
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [fetchProducts, fetchInventories, fetchWarehouses, fetchCategories]);
  const handleCategoryClick = useCallback(
    async (cat: Category) => {
      if (activeCategory === cat.id) {
        // Bỏ chọn danh mục -> Reset về trang 1
        setActiveCategory(null);
        setActiveCategoryName(null);
        setProductPage(1);
        setLoading(true);
        try {
          const res = await fetchProducts(1, activeSearch || undefined);
          setProducts(res.data || []);
          setProductLastPage(res.lastPage || 1);
        } catch {
          setError("Không thể tải sản phẩm.");
        } finally {
          setLoading(false);
        }
        return;
      }

      // Chọn danh mục mới
      setActiveCategory(cat.id);
      setActiveCategoryName(cat.name);
      setCategoryLoading(true);
      setProducts([]); // Xóa danh sách cũ

      try {
        const res = await categoryApi.getProductsByCategory(cat.name);
        setProducts(res.data || []);
        setProductLastPage(1); 
      } catch (err) {
        console.error("getProductsByCategory failed:", err);
        setError("Không thể tải sản phẩm theo danh mục.");
        setProducts([]);
      } finally {
        setCategoryLoading(false);
      }
    },
    [activeCategory, activeSearch, fetchProducts]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
    setActiveCategory(null);
    setActiveCategoryName(null);
    setProductPage(1);
    
    setLoading(true);
    try {
      const res = await fetchProducts(1, searchQuery);
      setProducts(res.data || []);
      setProductLastPage(res.lastPage || 1);
    } catch {
      setError("Tìm kiếm thất bại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchQuery("");
    setActiveSearch("");
    setActiveCategory(null);
    setActiveCategoryName(null);
    setProductPage(1);
    
    setLoading(true);
    try {
      const res = await fetchProducts(1);
      setProducts(res.data || []);
      setProductLastPage(res.lastPage || 1);
    } catch {
      setError("Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCategory = async () => {
    setActiveCategory(null);
    setActiveCategoryName(null);
    setProductPage(1);
    
    setLoading(true);
    try {
      const res = await fetchProducts(1, activeSearch || undefined);
      setProducts(res.data || []);
      setProductLastPage(res.lastPage || 1);
    } catch {
      setError("Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = productPage + 1;
    setLoadingMore(true);
    try {
      const res = await fetchProducts(nextPage, activeSearch || undefined);
      setProducts((prev) => [...prev, ...(res.data || [])]);
      setProductPage(nextPage);
      setProductLastPage(res.lastPage || 1);
    } catch {
      setError("Không thể tải thêm sản phẩm.");
    } finally {
      setLoadingMore(false);
    }
  };

  // ─── UI Renders ───
  if (loading && products.length === 0) {
    return (
      <>
        <Breadcrumb title={"Quản lý Kho & Sản phẩm"} pages={["Dashboard", "Sản phẩm"]} />
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

  if (error && products.length === 0) {
    return (
      <>
        <Breadcrumb title={"Quản lý Kho & Sản phẩm"} pages={["Dashboard", "Sản phẩm"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 flex items-center justify-center min-h-[400px]">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-blue text-white py-2 px-6 rounded-md hover:bg-opacity-90">Thử lại</button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Quản lý Kho & Sản phẩm"} pages={["Dashboard", "Sản phẩm"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5">
            {/* ── Product Grid ── */}
            <div className="lg:max-w-[770px] w-full">
              {/* Header + Search */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-semibold text-dark">Danh sách sản phẩm</h3>
                <div className="flex items-center gap-3">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm sản phẩm..."
                      className="border border-gray-3 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue"
                    />
                    <button type="submit" className="bg-gray-2 text-dark py-2 px-3 rounded-md hover:bg-gray-3 text-sm">Tìm</button>
                    {activeSearch && (
                      <button type="button" onClick={handleClearSearch} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
                    )}
                  </form>
                  <Link href="/blogs/blog-grid-with-sidebar/create" className="bg-blue text-white py-2 px-4 rounded-md hover:bg-opacity-90 inline-block text-center whitespace-nowrap">
                    Thêm sản phẩm
                  </Link>
                </div>
              </div>

              {/* Active filters */}
              {(activeSearch || activeCategoryName) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {activeCategoryName && (
                    <span className="inline-flex items-center gap-1.5 bg-blue/10 text-blue text-sm font-medium px-3 py-1.5 rounded-full">
                      {activeCategoryName}
                      <button onClick={handleClearCategory} className="ml-0.5 hover:text-red-500 transition-colors" title="Xoá bộ lọc danh mục">✕</button>
                    </span>
                  )}
                  {activeSearch && (
                    <span className="text-sm text-gray-500">
                      Tìm kiếm: <span className="font-medium text-dark">&ldquo;{activeSearch}&rdquo;</span>
                    </span>
                  )}
                </div>
              )}

              {/* Category loading overlay */}
              {categoryLoading && (
                <div className="flex items-center justify-center py-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-blue border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Đang tải sản phẩm theo danh mục...</p>
                  </div>
                </div>
              )}

              {/* Product Cards */}
              {!categoryLoading && products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-1 p-10 text-center">
                  <p className="text-gray-400 text-lg">Không tìm thấy sản phẩm nào.</p>
                </div>
              ) : (
                !categoryLoading && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-7.5">
                    {products.map((product) => {
                      const totalStock = getTotalStock(product.id, inventories);
                      return (
                        <div key={product.id} className="bg-white rounded-xl shadow-1 overflow-hidden group">
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
                              <Link href={`/blogs/blog-details-with-sidebar/${product.id}`}>{product.name}</Link>
                            </h4>
                            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-blue font-bold text-xl">${product.price}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  totalStock > 20 ? "bg-green-100 text-green-600" : totalStock > 0 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"
                                }`}>
                                Còn hàng: {totalStock} {product.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}

              {/* Loading nhỏ khi bấm Xem thêm */}
              {loadingMore && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <div className="w-5 h-5 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                    Đang tải thêm...
                  </div>
                </div>
              )}
              {/* TẠM THỜI BỎ ĐI ĐIỀU KIỆN productPage < productLastPage ĐỂ TEST */}
              {!activeCategory && !loadingMore && !categoryLoading && products.length > 0 && products.length % 10 === 0 && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={handleLoadMore}
                    className="px-8 py-3 bg-dark text-white rounded-md font-medium hover:bg-gray-700 transition duration-200 ease-out"
                  >
                    Xem thêm sản phẩm
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
                    <p className="text-sm text-gray-400">Không có kho hàng nào.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {warehouses.map((wh) => (
                        <button key={wh.id} className="group flex items-center justify-between ease-out duration-200 text-dark hover:text-blue text-left">
                          {wh.name}
                          <span className="text-xs text-gray-4 ml-2 truncate max-w-[150px]">{wh.address}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Box */}
              <div className="shadow-1 bg-white rounded-xl mt-7.5">
                <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3 flex items-center justify-between">
                  <h2 className="font-medium text-lg text-dark">Danh mục sản phẩm</h2>
                  {activeCategory && (
                    <button onClick={handleClearCategory} className="text-xs text-gray-400 hover:text-red-500 transition-colors" title="Xoá bộ lọc">Xoá lọc ✕</button>
                  )}
                </div>
                <div className="p-4 sm:p-6">
                  {categories.length === 0 ? (
                    <p className="text-sm text-gray-400">Không có danh mục nào.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {categories.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat)}
                            className={`group flex items-center justify-between ease-out duration-200 rounded-lg px-3 py-2.5 text-left transition-all ${
                              isActive ? "bg-blue/10 text-blue font-semibold border border-blue/20" : "text-dark hover:text-blue hover:bg-gray-2/50"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {isActive && (
                                <svg className="w-4 h-4 text-blue flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              {cat.name}
                            </span>
                            {cat.products !== undefined && (
                              <span className={`inline-flex rounded-[30px] text-custom-xs px-1.5 ease-out duration-200 ${
                                  isActive ? "bg-blue text-white" : "bg-gray-2 group-hover:text-white group-hover:bg-blue"
                                }`}>
                                {cat.products}
                              </span>
                            )}
                          </button>
                        );
                      })}
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