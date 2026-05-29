"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productApi } from "@/service/map/inventory/inventory"; // Đảm bảo đường dẫn này đúng

// Định nghĩa type cho Product dựa trên backend trả về
interface Product {
  id: number;
  name: string;
  unit: string;
  price: number;
  thumbnail: string;
  origin: string;
  description: string;
}

const ProductPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Lấy dữ liệu từ URL
  const searchQuery = searchParams.get("search") || "";
  const currentPageFromUrl = parseInt(searchParams.get("page") || "1", 10);

  // State quản lý dữ liệu
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(currentPageFromUrl);

  // Hàm fetch dữ liệu
  const fetchProducts = useCallback(async (query: string, page: number) => {
    setLoading(true);
    setError(null);
    try {
      // Gọi đúng hàm search bạn viết ở backend
      const res = await productApi.search(query, page);
      
      // Backend trả về { total, page, totalPages, data }
      setProducts(res.data || []);
      setTotalPages(res.totalPages || 1);
      setCurrentPage(res.page || page);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại!");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect để gọi API khi search hoặc page thay đổi
  useEffect(() => {
    fetchProducts(searchQuery, currentPageFromUrl);
  }, [searchQuery, currentPageFromUrl, fetchProducts]);

  // Hàm chuyển trang (cập nhật URL)
  const handlePageChange = (newPage: number) => {
    // Giữ nguyên từ khóa search khi chuyển trang
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="pt-32 pb-16 min-h-screen bg-gray-1">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        
        {/* Tiêu đề trang */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark">
            {searchQuery ? `Kết quả tìm kiếm cho: "${searchQuery}"` : "Tất cả sản phẩm"}
          </h1>
          <p className="text-dark-4 text-sm mt-2">
            {!loading && `Tìm thấy ${products.length} sản phẩm`}
          </p>
        </div>

        {/* Trạng thái Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Trạng thái Lỗi */}
        {error && !loading && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md text-center">
            {error}
          </div>
        )}

        {/* Danh sách sản phẩm */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white border border-gray-3 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
              >
                {/* Thumbnail */}
                <Link href={`/shop-details/${product.id}`} className="block overflow-hidden">
                  <div className="relative w-full h-48 bg-gray-2">
                    <Image
                      src={product.thumbnail || "/images/placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholder.jpg";
                      }}
                    />
                  </div>
                </Link>

                {/* Thông tin sản phẩm */}
                <div className="p-4">
                  <Link href={`/shop-details/${product.id}`}>
                    <h3 className="text-sm font-medium text-dark line-clamp-2 hover:text-blue transition-colors duration-200 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                  </Link>
                  
                  {product.origin && (
                    <p className="text-xs text-dark-4 mt-1">Xuất xứ: {product.origin}</p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-base font-bold text-blue">
                      {product.price}
                    </span>
                    {product.unit && (
                      <span className="text-xs text-dark-4 bg-gray-1 px-2 py-1 rounded">
                        {product.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Không tìm thấy sản phẩm */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-gray-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-dark">Không tìm thấy sản phẩm nào</h3>
            <p className="mt-2 text-sm text-dark-4">
              Thử tìm kiếm với từ khóa khác hoặc{" "}
              <Link href="/product" className="text-blue hover:underline">
                xem tất cả sản phẩm
              </Link>
            </p>
          </div>
        )}

        {/* Phân trang (Pagination) */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            {/* Nút Previous */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm rounded border ${
                currentPage === 1
                  ? "bg-gray-2 text-gray-4 border-gray-3 cursor-not-allowed"
                  : "bg-white text-dark border-gray-3 hover:bg-blue hover:text-white hover:border-blue"
              } transition-colors`}
            >
              Trước
            </button>

            {/* Các số trang */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 text-sm rounded border flex items-center justify-center ${
                  currentPage === page
                    ? "bg-blue text-white border-blue"
                    : "bg-white text-dark border-gray-3 hover:bg-blue hover:text-white hover:border-blue"
                } transition-colors`}
              >
                {page}
              </button>
            ))}

            {/* Nút Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm rounded border ${
                currentPage === totalPages
                  ? "bg-gray-2 text-gray-4 border-gray-3 cursor-not-allowed"
                  : "bg-white text-dark border-gray-3 hover:bg-blue hover:text-white hover:border-blue"
              } transition-colors`}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default ProductPage;