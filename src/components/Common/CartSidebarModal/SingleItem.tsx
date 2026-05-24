import React, { useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  removeCartItemAsync,
  updateCartItemAsync,
  CartItemLocal,
} from "@/redux/features/cartItem-slide";

const SingleItem = ({ item }: { item: CartItemLocal }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentPrice = item.discountedPrice ?? item.price ?? 0;
  const subtotal = currentPrice * item.quantity;

  // ======== XÓA SẢN PHẨM QUA THUNK ========
  const handleRemoveFromCart = async () => {
    if (!item.cartItemId || isUpdating) return;
    setIsUpdating(true);
    try {
      await dispatch(removeCartItemAsync(item.cartItemId)).unwrap();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm khỏi giỏ hàng:", error);
      alert("Không thể xóa sản phẩm khỏi giỏ hàng");
    } finally {
      setIsUpdating(false);
    }
  };

  // ======== CẬP NHẬT SỐ LƯỢNG QUA THUNK ========
  const handleUpdateQuantity = async (newQty: number) => {
    if (!item.cartItemId || isUpdating || newQty < 1) return;
    setIsUpdating(true);
    try {
      await dispatch(
        updateCartItemAsync({ cartItemId: item.cartItemId, quantity: newQty })
      ).unwrap();
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      alert("Không thể cập nhật số lượng");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`flex items-center border-t border-gray-3 py-5 px-7.5 ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Tên sản phẩm */}
      <div className="min-w-[400px]">
        <div className="flex items-center justify-between gap-5">
          <div className="w-full flex items-center gap-5.5">
            <div className="flex items-center justify-center rounded-[5px] bg-gray-2 max-w-[80px] w-full h-17.5">
              <Image
                width={200}
                height={200}
                src={item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0] || "/images/placeholder.jpg"}
                alt={item.title || "product"}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-dark ease-out duration-200 hover:text-blue">
                <a href="#">{item.title}</a>
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Giá */}
      <div className="min-w-[180px]">
        <p className="text-dark">${currentPrice.toFixed(2)}</p>
      </div>

      {/* Số lượng */}
      <div className="min-w-[275px]">
        <div className="w-max flex items-center rounded-md border border-gray-3">
          <button
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            aria-label="button for remove product"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33301 10.0001C3.33301 9.53984 3.7061 9.16675 4.16634 9.16675H15.833C16.2932 9.16675 16.6663 9.53984 16.6663 10.0001C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10.0001Z" fill="" />
            </svg>
          </button>
          <span className="flex items-center justify-center w-16 h-11.5 border-x border-gray-4 select-none">
            {item.quantity}
          </span>
          <button
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            disabled={isUpdating}
            aria-label="button for add product"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.33301 10C3.33301 9.5398 3.7061 9.16671 4.16634 9.16671H15.833C16.2932 9.16671 16.6663 9.5398 16.6663 10C16.6663 10.4603 16.2932 10.8334 15.833 10.8334H4.16634C3.7061 10.8334 3.33301 10.4603 3.33301 10Z" fill="" />
              <path d="M9.99967 16.6667C9.53944 16.6667 9.16634 16.2936 9.16634 15.8334L9.16634 4.16671C9.16634 3.70647 9.53944 3.33337 9.99967 3.33337C10.4599 3.33337 10.833 3.70647 10.833 4.16671L10.833 15.8334C10.833 16.2936 10.4599 16.6667 9.99967 16.6667Z" fill="" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tổng phụ */}
      <div className="min-w-[200px]">
        <p className="text-dark font-medium">${subtotal.toFixed(2)}</p>
      </div>

      {/* Nút Xóa */}
      <div className="min-w-[50px] flex justify-end">
        <button
          onClick={handleRemoveFromCart}
          disabled={isUpdating}
          aria-label="button for remove product from cart"
          className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red disabled:cursor-not-allowed"
        >
          <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M3.99992 2.66659C3.63173 2.66659 3.33325 2.96506 3.33325 3.33325V13.3333C3.33325 13.7014 3.63173 13.9999 3.99992 13.9999H11.9999C12.3681 13.9999 12.6666 13.7014 12.6666 13.3333V3.33325C12.6666 2.96506 12.3681 2.66659 11.9999 2.66659H3.99992ZM1.99992 3.33325C1.99992 2.22868 2.89535 1.33325 3.99992 1.33325H11.9999C13.1045 1.33325 13.9999 2.22868 13.9999 3.33325V13.3333C13.9999 14.4378 13.1045 15.3333 11.9999 15.3333H3.99992C2.89535 15.3333 1.99992 14.4378 1.99992 13.3333V3.33325Z" fill="" />
            <path fillRule="evenodd" clipRule="evenodd" d="M6.66659 1.33325C6.2984 1.33325 5.99992 1.63173 5.99992 1.99992V2.66659H9.99992V1.99992C9.99992 1.63173 9.70144 1.33325 9.33325 1.33325H6.66659ZM11.3333 2.66659V1.99992C11.3333 0.895349 10.4378 -7.62939e-05 9.33325 -7.62939e-05H6.66659C5.56202 -7.62939e-05 4.66659 0.895349 4.66659 1.99992V2.66659H2.66659C2.2984 2.66659 1.99992 2.96506 1.99992 3.33325C1.99992 3.70144 2.2984 3.99992 2.66659 3.99992H13.3333C13.7014 3.99992 13.9999 3.70144 13.9999 3.33325C13.9999 2.96506 13.7014 2.66659 13.3333 2.66659H11.3333Z" fill="" />
            <path d="M6.66659 6.66659C6.66659 6.2984 6.36811 5.99992 5.99992 5.99992C5.63173 5.99992 5.33325 6.2984 5.33325 6.66659V10.6666C5.33325 11.0348 5.63173 11.3333 5.99992 11.3333C6.36811 11.3333 6.66659 11.0348 6.66659 10.6666V6.66659Z" fill="" />
            <path d="M10.6666 6.66659C10.6666 6.2984 10.3681 5.99992 9.99992 5.99992C9.63173 5.99992 9.33325 6.2984 9.33325 6.66659V10.6666C9.33325 11.0348 9.63173 11.3333 9.99992 11.3333C10.3681 11.3333 10.6666 11.0348 10.6666 10.6666V6.66659Z" fill="" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SingleItem;