"use client"; // Bắt buộc nếu dùng state và event

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import { getClientSideProducts } from "@/components/Shop/shopData"; // Dùng hàm client side

const NewArrival = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Gọi API lần đầu
  useEffect(() => {
    fetchProducts(1);
  }, []);

  const fetchProducts = async (pageNum: number) => {
    // Giả sử bạn đã sửa hàm getClientSideProducts trả về {data, totalPages}
    const result = await getClientSideProducts(pageNum);
    setProducts(prev => [...prev, ...result.data]);
    setTotalPages(result.totalPages);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage);
  };

  return (
    <section className="overflow-hidden pt-15">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">Hàng mới</h2>
          </div>
          <Link href="/shop-with-sidebar" className="...">Tất cả</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
          {products.map((item, key) => (
            <ProductItem item={item} key={key} />
          ))}
        </div>

        {/* Nút Xem Thêm */}
        {page < totalPages && (
          <div className="text-center mt-8">
            <button 
              onClick={handleLoadMore}
              className="px-8 py-3 bg-dark text-white rounded-md hover:bg-gray-700 transition"
            >
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrival;