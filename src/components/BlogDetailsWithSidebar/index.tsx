"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  productApi,
  inventoryApi,
  type Product,
  type Inventory,
} from "@/service/map/inventory/inventory";

// ─── Helper ───
const getTotalStock = (productId: string, inventories: Inventory[]): number =>
  inventories
    .filter((inv) => inv.productId === productId)
    .reduce((sum, inv) => sum + inv.quantity, 0);

// ─── Component nội dung chính ───
const ShopContent = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search"); // Lấy từ khóa từ URL (VD: ?search=Màn hình)

  // --- Data state ---
  const [products, setProducts] = useState<Product[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);

  // --- UI state ---
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // ─── 1. Fetch Tồn kho (Chạy 1 lần) ───
  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const all = await inventoryApi.getAllFlatten();
        setInventories(all);
      } catch (err) {
        console.error("Lỗi tải tồn kho:", err);
      }
    };
    fetchInventories();
  }, []);

  // ─── 2. Fetch Sản phẩm (Chạy lại khi search hoặc page thay đổi) ───
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let res;
        if (searchQuery?.trim()) {
          // ✅ Có từ khóa tìm kiếm -> Gọi API Search
          res = await productApi.search(searchQuery.trim(), currentPage);
        } else {
          // ✅ Không có từ khóa -> Gọi API GetAll
          res = await productApi.getAll(currentPage);
        }

        setProducts(res.data || []);
        setLastPage(res.lastPage || 1);
      } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, currentPage]); // Dependency array lắng nghe thay đổi

  // ─── Loading UI ───
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-2">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden py-15 lg:py-20 bg-gray-2">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        
        {/* ─── Thông báo kết quả tìm kiếm ─── */}
        {searchQuery && (
          <div className="mb-8 bg-white rounded-xl shadow-1 p-4 flex items-center justify-between">
            <p className="text-dark text-sm">
              Kết quả tìm kiếm cho: <span className="font-bold text-blue">"{searchQuery}"</span> 
              <span className="text-gray-400 ml-2">({products.length} sản phẩm)</span>
            </p>
            <Link href="/shop-without-sidebar" className="text-sm text-gray-500 hover:text-red-500 transition font-medium">
              Xoá tìm kiếm ✕
            </Link>
          </div>
        )}

        {/* ─── Danh sách sản phẩm ─── */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-1 p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">Không tìm thấy sản phẩm phù hợp.</p>
            <Link href="/shop-without-sidebar" className="bg-blue text-white py-2.5 px-6 rounded-md hover:bg-opacity-90 transition">
              Xem tất cả sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7.5">
            {products.map((product) => {
              const totalStock = getTotalStock(product.id, inventories);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-1 overflow-hidden group"
                >
                  {/* Ảnh sản phẩm */}
                  <div className="relative w-full h-60 overflow-hidden">
                    <Image
                      src={product.thumbnail || "/images/products/default.jpg"}
                      alt={product.name}
                      layout="fill"
                      objectFit="cover"
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Nút Add to cart hiện khi hover */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                       <button className="bg-blue text-white text-sm font-medium py-2.5 px-5 rounded-md hover:bg-opacity-90 shadow-lg whitespace-nowrap">
                         Add to cart
                       </button>
                    </div>
                  </div>
                  
                  {/* Thông tin sản phẩm */}
                  <div className="p-5">
                    {/* Tên SP - Truyền search param vào link để nút quay lại ở Detail hoạt động */}
                    <h4 className="font-medium text-dark text-sm mb-2 hover:text-blue transition line-clamp-2 min-h-[2.5rem]">
                      <Link href={`/blogs/blog-details-with-sidebar/${product.id}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`}>
                        {product.name}
                      </Link>
                    </h4>
                    
                    {/* Rating (Hiển thị 0 sao như hình bạn gửi) */}
                    <div className="flex items-center gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-blue font-bold text-lg">
                        ${product.price}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          totalStock > 20
                            ? "bg-green-100 text-green-600"
                            : totalStock > 0
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        Còn: {totalStock}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {lastPage > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-4 py-2 rounded-md border border-gray-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
            >
              ← Trước
            </button>
            
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition ${
                  p === currentPage
                    ? "bg-blue text-white"
                    : "border border-gray-3 hover:bg-white"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
              disabled={currentPage >= lastPage}
              className="px-4 py-2 rounded-md border border-gray-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
            >
              Sau →
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ─── Export bọc Suspense ───
const ShopWithoutSidebar = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
};

export default ShopWithoutSidebar;