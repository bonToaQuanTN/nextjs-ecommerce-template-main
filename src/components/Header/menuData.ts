import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Phổ biến",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Cửa hàng",
    newTab: false,
    path: "/shop-with-sidebar",
  },
  {
    id: 3,
    title: "Liên Hệ",
    newTab: false,
    path: "/contact",
  },
  {
   id: 4,
        title: "Đăng ký",
        newTab: false,
        path: "/signup",
  },
  {
        id: 5,
        title: "Tài khoản",
        newTab: false,
        path: "/my-account",
      },
  {
    id: 6,
    title: "Trang",
    newTab: false,
    path: "/",
    submenu: [
      {
        id: 61,
        title: "Cửa hàng và danh mục",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 62,
        title: "Tất cả sản phẩm",
        newTab: false,
        path: "/shop-without-sidebar",
      },
      {
        id: 64,
        title: "Thanh Toán",
        newTab: false,
        path: "/checkout",
      },
      {
        id: 65,
        title: "Giỏ hàng",
        newTab: false,
        path: "/cart",
      },
      {
        id: 63,
        title: "Error fanpage",
        newTab: false,
        path: "/error",
      },
      {
        id: 66,
        title: "Mail thành công",
        newTab: false,
        path: "/mail-success",
      },
    ],
  },
  {
    id: 7,
    title: "Quản lý",
    newTab: false,
    path: "/",
    submenu: [
      {
        id: 72,
        title: "Người dùng hệ thống",
        newTab: false,
        path: "/blogs/blog-grid",
      },
      {
        id: 74,
        title: "Quyền người dùng",
        newTab: false,
        path: "/blogs/blog-details",
      },
      {
        id: 71,
        title: "Tổng quan kho",
        newTab: false,
        path: "/blogs/blog-grid-with-sidebar",
      },
      {
        id: 73,
        title: "Chi tiết kho",
        newTab: false,
        path: "/blogs/blog-details-with-sidebar",
      },
    ],
  },
];
