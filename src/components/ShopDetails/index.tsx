"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addItemToCartAsync } from "@/redux/features/cartItem-slide";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewd from "./RecentlyViewd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";

const ShopDetails = () => {
  const params = useParams(); 
  const productId = params.id as string;
  const dispatch = useDispatch<AppDispatch>();

  const [activeColor, setActiveColor] = useState("blue");
  const { openPreviewModal } = usePreviewSlider();
  const [previewImg, setPreviewImg] = useState(0);

  const [storage, setStorage] = useState("gb128");
  const [type, setType] = useState("active");
  const [sim, setSim] = useState("dual");
  const [quantity, setQuantity] = useState(1);

  const [activeTab, setActiveTab] = useState("tabOne");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const storages = [
    { id: "gb128", title: "128 GB" },
    { id: "gb256", title: "256 GB" },
    { id: "gb512", title: "512 GB" },
  ];

  const types = [
    { id: "active", title: "Active" },
    { id: "inactive", title: "Inactive" },
  ];

  const sims = [
    { id: "dual", title: "Dual" },
    { id: "e-sim", title: "E Sim" },
  ];

  const tabs = [
    { id: "tabOne", title: "Mô tả" },
    { id: "tabTwo", title: "Thông tin bổ sung" },
    { id: "tabThree", title: "Đánh giá" },
  ];

  const colors = ["red", "blue", "orange", "pink", "purple"];

  useEffect(() => {
    if (!productId) return;

    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/products/${productId}`);
        
        if (!res.ok) throw new Error("Sản phẩm không tồn tại");
        
        const data = await res.json();
        const formattedProduct = {
          id: data.id, // Rất quan trọng: phải có id để Redux gửi lên server
          title: data.name,
          description: data.description || "Chưa có mô tả cho sản phẩm này.",
          price: Number((parseFloat(data.price) * 1.3).toFixed(2)),
          discountedPrice: Number(parseFloat(data.price).toFixed(2)),
          imgs: {
            previews: data.thumbnail ? [data.thumbnail] : ["/images/product-placeholder.png"],
            thumbnails: data.thumbnail ? [data.thumbnail] : ["/images/product-placeholder.png"]
          }
        };

        setProduct(formattedProduct);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handlePreviewSlider = () => {
    openPreviewModal();
  };

  // SỬA LỖI Ở ĐÂY: Truyền đúng cấu trúc mà addItemToCartAsync yêu cầu
  const handleAddToCart = async () => {
    if (isAdding || !product) return; 
    setIsAdding(true);
    
    try {
      // addItemToCartAsync cần { item: Product, quantity: number }
      await dispatch(addItemToCartAsync({ item: product, quantity })).unwrap();
      alert("Thêm vào giỏ hàng thành công!");
    } catch (error: any) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      alert(error || "Thêm vào giỏ hàng thất bại. Vui lòng đăng nhập!");
    } finally {
      setIsAdding(false);
    }
  };

  // Logic tăng giảm số lượng
  const handleIncreaseQty = () => setQuantity(prev => prev + 1);
  const handleDecreaseQty = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl font-semibold text-dark">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-2xl font-semibold text-red-500">{error || "Không tìm thấy sản phẩm"}</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title={"Shop Details"} pages={["shop details"]} />

      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            
            {/* Phần Image */}
            <div className="lg:max-w-[570px] w-full">
              <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                <div>
                  <button
                    onClick={handlePreviewSlider}
                    aria-label="button for zoom"
                    className="gallery__Image w-11 h-11 rounded-[5px] bg-gray-1 shadow-1 flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 lg:top-6 right-4 lg:right-6 z-50"
                  >
                     <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9.11493 1.14581L9.16665 1.14581C9.54634 1.14581 9.85415 1.45362 9.85415 1.83331C9.85415 2.21301 9.54634 2.52081 9.16665 2.52081C7.41873 2.52081 6.17695 2.52227 5.23492 2.64893C4.31268 2.77292 3.78133 3.00545 3.39339 3.39339C3.00545 3.78133 2.77292 4.31268 2.64893 5.23492C2.52227 6.17695 2.52081 7.41873 2.52081 9.16665C2.52081 9.54634 2.21301 9.85415 1.83331 9.85415C1.45362 9.85415 1.14581 9.54634 1.14581 9.16665L1.14581 9.11493C1.1458 7.43032 1.14579 6.09599 1.28619 5.05171C1.43068 3.97699 1.73512 3.10712 2.42112 2.42112C3.10712 1.73512 3.97699 1.43068 5.05171 1.28619C6.09599 1.14579 7.43032 1.1458 9.11493 1.14581ZM16.765 2.64893C15.823 2.52227 14.5812 2.52081 12.8333 2.52081C12.4536 2.52081 12.1458 2.21301 12.1458 1.83331C12.1458 1.45362 12.4536 1.14581 12.8333 1.14581L12.885 1.14581C14.5696 1.1458 15.904 1.14579 16.9483 1.28619C18.023 1.43068 18.8928 1.73512 19.5788 2.42112C20.2648 3.10712 20.5693 3.97699 20.7138 5.05171C20.8542 6.09599 20.8542 7.43032 20.8541 9.11494V9.16665C20.8541 9.54634 20.5463 9.85415 20.1666 9.85415C19.787 9.85415 19.4791 9.54634 19.4791 9.16665C19.4791 7.41873 19.4777 6.17695 19.351 5.23492C19.227 4.31268 18.9945 3.78133 18.6066 3.39339C18.2186 3.00545 17.6873 2.77292 16.765 2.64893ZM1.83331 12.1458C2.21301 12.1458 2.52081 12.4536 2.52081 12.8333C2.52081 14.5812 2.52227 15.823 2.64893 16.765C2.77292 17.6873 3.00545 18.2186 3.39339 18.6066C3.78133 18.9945 4.31268 19.227 5.23492 19.351C6.17695 19.4777 7.41873 19.4791 9.16665 19.4791C9.54634 19.4791 9.85415 19.787 9.85415 20.1666C9.85415 20.5463 9.54634 20.8541 9.16665 20.8541H9.11494C7.43032 20.8542 6.09599 20.8542 5.05171 20.7138C3.97699 20.5693 3.10712 20.2648 2.42112 19.5788C1.73512 18.8928 1.43068 18.023 1.28619 16.9483C1.14579 15.904 1.1458 14.5696 1.14581 12.885L1.14581 12.8333C1.14581 12.4536 1.45362 12.1458 1.83331 12.1458ZM20.1666 12.1458C20.5463 12.1458 20.8541 12.4536 20.8541 12.8333V12.885C20.8542 14.5696 20.8542 15.904 20.7138 16.9483C20.5693 18.023 20.2648 18.8928 19.5788 19.5788C18.8928 20.2648 18.023 20.5693 16.9483 20.7138C15.904 20.8542 14.5696 20.8542 12.885 20.8541H12.8333C12.4536 20.8541 12.1458 20.5463 12.1458 20.1666C12.1458 19.787 12.4536 19.4791 12.8333 19.4791C14.5812 19.4791 15.823 19.4777 16.765 19.351C17.6873 19.227 18.2186 18.9945 18.6066 18.6066C18.9945 18.2186 19.227 17.6873 19.351 16.765C19.4777 15.823 19.4791 14.5812 19.4791 12.8333C19.4791 12.4536 19.787 12.1458 20.1666 12.1458Z" fill="" /></svg>
                  </button>

                  {product.imgs?.previews?.[previewImg] && (
                    <Image
                      src={product.imgs.previews[previewImg]}
                      alt={product.title}
                      width={400}
                      height={400}
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                {product.imgs?.thumbnails.map((item: string, key: number) => (
                  <button
                    onClick={() => setPreviewImg(key)}
                    key={key}
                    className={`flex items-center justify-center w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 ease-out duration-200 border-2 hover:border-blue ${key === previewImg ? "border-blue" : "border-transparent"}`}
                  >
                    <Image width={50} height={50} src={item} alt="thumbnail" style={{ objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Product content */}
            <div className="max-w-[539px] w-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                  {product.title}
                </h2>
                <div className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                  30% OFF
                </div>
              </div>

              <p className="text-gray-5 text-sm mb-4 line-clamp-2">{product.description}</p>

              <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1 text-[#FFA645]">
                    {/* Stars SVG giữ nguyên */}
                  </div>
                  <span> (5 đánh giá của khách hàng) </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_375_9221)"><path d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z" fill="#22AD5C" /><path d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z" fill="#22AD5C" /></g><defs><clipPath id="clip0_375_9221"><rect width="20" height="20" fill="white" /></clipPath></defs></svg>
                  <span className="text-green"> Còn hàng </span>
                </div>
              </div>

              <h3 className="font-medium text-custom-1 mb-4.5">
                <span className="line-through text-gray-5"> ${product.price} </span>
                <span className="text-sm sm:text-base text-dark ml-2"> ${product.discountedPrice} </span>
              </h3>

              {/* NÚT MUA HÀNG & THÊM VÀO GIỎ */}
              <div className="flex flex-wrap items-center gap-4.5 mt-7.5">
                {/* Quantity Input */}
                <div className="flex items-center rounded-md border border-gray-3">
                  <button
                    onClick={handleDecreaseQty}
                    disabled={quantity <= 1}
                    className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue disabled:opacity-40"
                  >
                    <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" fill="" /></svg>
                  </button>
                  <span className="flex items-center justify-center w-16 h-11.5 border-x border-gray-4 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncreaseQty}
                    className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue"
                  >
                    <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" fill="" /><path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" fill="" /></svg>
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className={`inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark ${isAdding ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isAdding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="overflow-hidden bg-gray-2 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center bg-white rounded-[10px] shadow-1 gap-5 xl:gap-12.5 py-4.5 px-4 sm:px-6">
            {tabs.map((item, key) => (
              <button key={key} onClick={() => setActiveTab(item.id)} className={`font-medium lg:text-lg ease-out duration-200 hover:text-blue relative before:h-0.5 before:bg-blue before:absolute before:left-0 before:bottom-0 before:ease-out before:duration-200 hover:before:w-full ${activeTab === item.id ? "text-blue before:w-full" : "text-dark before:w-0"}`}>
                {item.title}
              </button>
            ))}
          </div>

          <div className={`flex-col sm:flex-row gap-7.5 xl:gap-12.5 mt-12.5 ${activeTab === "tabOne" ? "flex" : "hidden"}`}>
            <div className="max-w-[670px] w-full">
              <h2 className="font-medium text-2xl text-dark mb-7">Mô Tả:</h2>
              <p className="mb-6">{product.description}</p>
            </div>
          </div>
        </div>
      </section>

      <RecentlyViewd />
      <Newsletter />
    </>
  );
};

export default ShopDetails;