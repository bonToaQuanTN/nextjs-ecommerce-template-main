"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import GenderDropdown from "./GenderDropdown";
import SizeDropdown from "./SizeDropdown";
import ColorsDropdwon from "./ColorsDropdwon";
import PriceDropdown from "./PriceDropdown";
import { getClientSideProducts } from "@/components/Shop/shopData";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";

const ShopWithSidebar = () => {
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  const options = [
    { label: "Latest Products", value: "0" },
    { label: "Best Selling", value: "1" },
    { label: "Old Products", value: "2" },
  ];

  const categories = [
    { name: "Desktop", products: 10, isRefined: true },
    { name: "Laptop", products: 12, isRefined: false },
    { name: "Monitor", products: 30, isRefined: false },
    { name: "UPS", products: 23, isRefined: false },
    { name: "Phone", products: 10, isRefined: false },
    { name: "Watch", products: 13, isRefined: false },
  ];

  const genders = [
    { name: "Men", products: 10 },
    { name: "Women", products: 23 },
    { name: "Unisex", products: 8 },
  ];

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);

    function handleClickOutside(event) {
      if (!event.target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await getClientSideProducts(currentPage);
        setProducts(result.data);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Breadcrumb title={"Explore All Products"} pages={["shop", "/", "shop with sidebar"]} />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            <div className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
              productSidebar ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto" : "-translate-x-full"
            }`}>
            </div>
            <div className="xl:max-w-[870px] w-full">
              <div className="rounded-lg bg-white shadow-1 pl-3 pr-2.5 py-2.5 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <CustomSelect options={options} />
                    <p>
                      Page <span className="text-dark">{currentPage}</span> of <span>{totalPages}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button onClick={() => setProductStyle("grid")} aria-label="button for product grid tab" className={`${productStyle === "grid" ? "bg-blue border-blue text-white" : "text-dark bg-gray-1 border-gray-3"} flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}>
                    </button>
                    <button onClick={() => setProductStyle("list")} aria-label="button for product list tab" className={`${productStyle === "list" ? "bg-blue border-blue text-white" : "text-dark bg-gray-1 border-gray-3"} flex items-center justify-center w-10.5 h-9 rounded-[5px] border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}>
                    </button>
                  </div>
                </div>
              </div>
              <div className={`${productStyle === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9" : "flex flex-col gap-7.5"}`}>
                
                {loading ? (
                  <div className="col-span-full text-center py-20 text-dark-4">
                     <span className="animate-pulse">Loading products...</span>
                  </div>
                ) : (
                  products.map((item) =>
                    productStyle === "grid" ? (
                      <SingleGridItem item={item} key={item.id} />
                    ) : (
                      <SingleListItem item={item} key={item.id} />
                    )
                  )
                )}
                
                {!loading && products.length === 0 && (
                  <div className="col-span-full text-center py-20 text-dark-4">
                    No products found.
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-15">
                <div className="bg-white shadow-1 rounded-md p-2">
                  <ul className="flex items-center">
                    <li>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev, 1))}
                        disabled={currentPage === 1}
                        aria-label="button for pagination previous"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] disabled:text-gray-4 hover:text-white hover:bg-blue"
                      >
                      </button>
                    </li>
                    {pageNumbers.map(number => (
                      <li key={number}>
                        <button
                          onClick={() => setCurrentPage(number)}
                          className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${currentPage === number ? "bg-blue text-white" : "hover:bg-blue"}`}
                        >
                          {number}
                        </button>
                      </li>
                    ))}

                    <li>
                      <button
                        onClick={() => setCurrentPage(next => Math.min(next, totalPages))} // Tránh vượt quá số trang tối đa
                        disabled={currentPage === totalPages}
                        aria-label="button for pagination next"
                        type="button"
                        className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] disabled:text-gray-4 hover:text-white hover:bg-blue"
                      >
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;