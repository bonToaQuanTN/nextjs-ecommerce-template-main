import React from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";

// 1. SỬA IMPORT: Xóa import 'shopData' cũ, thay bằng hàm fetch mới
import { getServerSideProducts } from "@/components/Shop/shopData";

// 2. SỬA COMPONENT: Thêm chữ 'async' để có thể dùng 'await'
const BestSeller = async () => {
  
  // 3. GỌI API: Lấy dữ liệu từ Backend (Mặc định lấy trang 1)
  const products = await getServerSideProducts(1);

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              This Month
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Best Sellers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {/* <!-- Best Sellers item --> */}
          
          {/* 4. SỬA LOGIC MAP: 
              - Đổi 'shopData' thành 'products'
              - Đổi slice(1, 7) thành slice(0, 6) để lấy 6 sản phẩm đầu tiên từ Backend 
          */}
          {products.slice(0, 6).map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
          
          {/* Thêm đoạn này để tránh crash web nếu Backend chưa chạy hoặc bị lỗi */}
          {products.length === 0 && (
            <p className="col-span-full text-center text-dark-4 py-10">No products found.</p>
          )}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;