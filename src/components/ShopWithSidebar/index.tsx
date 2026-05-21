"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import GenderDropdown from "./GenderDropdown";
import SizeDropdown from "./SizeDropdown";
import ColorsDropdwon from "./ColorsDropdwon";
import PriceDropdown from "./PriceDropdown";
import CategoryDropdown from "./CategoryDropdown";
import { getClientSideProducts, getClientSideCategories } from "@/components/Shop/shopData";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";

const ShopWithSidebar = () => {
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Giá trị tạm thời trong ô input
  const [activeSearch, setActiveSearch] = useState<string | null>(null); // Giá trị thật sự gửi đi gọi API
  
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

   const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery); 
    setCurrentPage(1); 
  };
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
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  // 2. useEffect ĐỂ LẤY DANH SÁCH CATEGORIES KHI LOAD TRANG
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getClientSideCategories();
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await getClientSideProducts(currentPage, selectedCategoryName);
        setProducts(result.data);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, selectedCategoryName]);
  const handleCategorySelect = (categoryName: string | null) => {
    setSelectedCategoryName(categoryName);
    setCurrentPage(1);
  };

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Breadcrumb title={"Khám phá tất cả sản phẩm"} pages={["shop", "/", "shop with sidebar"]} />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-7.5">
            <div className={`sidebar-content fixed xl:z-1 z-9999 left-0 top-0 xl:translate-x-0 xl:static max-w-[310px] xl:max-w-[270px] w-full ease-out duration-200 ${
              productSidebar ? "translate-x-0 bg-white p-5 h-screen overflow-y-auto" : "-translate-x-full"
            }`}>
              
              {/* 5. TRUYỀN PROPS VÀO CATEGORYDROPDOWN */}
              <CategoryDropdown 
                categories={categories} 
                activeCategoryName={selectedCategoryName}
                onSelectCategory={handleCategorySelect}
              />
              <div className="mt-6">
                 <PriceDropdown />
              </div>
            </div>

            <div className="xl:max-w-[870px] w-full">
              {/* ... Phần header và sort giữ nguyên ... */}
              
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
                    No products found in this category.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;