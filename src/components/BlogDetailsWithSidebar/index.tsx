import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import { mockProducts, mockCategories, mockWarehouses, mockInventory } from "@/service/map/mockdata/mockdata";

const ProductDetails = () => {
  const product = mockProducts[0]; 
  const stockData = mockInventory
    .filter((inv) => inv.productId === product.id)
    .map((inv) => {
      const warehouse = mockWarehouses.find((wh) => wh.id === inv.warehouseId);
      return { ...inv, warehouseName: warehouse?.name, warehouseAddress: warehouse?.address };
    });
  return (
    <>
      <Breadcrumb title={"Chi tiết sản phẩm"} pages={["Sản phẩm", "Chi tiết"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-12.5">
            
            {/* <!-- Product Info --> */}
            <div className="lg:max-w-[750px] w-full">
              <div className="rounded-[10px] overflow-hidden mb-7.5 bg-white p-5">
                <Image
                  className="rounded-[10px] w-full object-cover"
                  src={product.thumbnail || "/images/products/default.jpg"}
                  alt={product.name}
                  width={750}
                  height={477}
                />
              </div>

              <div className="bg-white p-7.5 rounded-xl shadow-1">
                <h2 className="font-medium text-dark text-2xl mb-4">{product.name}</h2>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-blue font-bold text-2xl">${product.price}</span>
                  <span className="text-gray-4">|</span>
                  <span className="text-dark">Xuất xứ: {product.origin}</span>
                  <span className="text-gray-4">|</span>
                  <span className="text-dark">Đơn vị: {product.unit}</span>
                </div>

                <p className="mb-6 text-gray-500 leading-relaxed">{product.description}</p>

                {/* Bảng Tồn Kho theo Kho hàng */}
                <div className="mt-7.5">
                  <h3 className="font-medium text-dark text-lg mb-4">Tình trạng tồn kho</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border border-gray-3 rounded-lg overflow-hidden">
                      <thead className="bg-gray-2 border-b border-gray-3">
                        <tr>
                          <th className="py-3 px-4 text-dark font-medium">Kho hàng</th>
                          <th className="py-3 px-4 text-dark font-medium">Địa chỉ</th>
                          <th className="py-3 px-4 text-dark font-medium">Số lượng tồn</th>
                          <th className="py-3 px-4 text-dark font-medium">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockData.map((stock) => (
                          <tr key={stock.id} className="border-b border-gray-3 last:border-0">
                            <td className="py-3 px-4">{stock.warehouseName}</td>
                            <td className="py-3 px-4 text-gray-500">{stock.warehouseAddress}</td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${stock.quantity < 20 ? 'text-red-500' : 'text-green-600'}`}>
                                {stock.quantity} {product.unit}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <button className="text-blue hover:underline text-sm">Nhập thêm</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* <!-- Sidebar --> */}
            <div className="lg:max-w-[370px] w-full">
              <div className="shadow-1 bg-white rounded-xl p-6">
                <h3 className="font-medium text-lg text-dark mb-4">Thao tác nhanh</h3>
                <div className="flex flex-col gap-3">
                  <button className="w-full bg-blue text-white py-3 rounded-md hover:bg-opacity-90">Chỉnh sửa sản phẩm</button>
                  <button className="w-full bg-gray-2 text-dark py-3 rounded-md hover:bg-gray-3">Xuất kho</button>
                  <button className="w-full bg-gray-2 text-dark py-3 rounded-md hover:bg-gray-3">Nhập kho</button>
                </div>
              </div>

              <div className="shadow-1 bg-white rounded-xl mt-7.5 p-6">
                <h3 className="font-medium text-lg text-dark mb-4">Đơn hàng gần đây</h3>
                {/* Map order_items ở đây thay vì LatestPosts */}
                <p className="text-gray-400 text-sm">Chưa có đơn hàng nào.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetails;