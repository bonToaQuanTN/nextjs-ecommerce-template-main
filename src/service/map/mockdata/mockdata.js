export const mockCategories = [
  { id: "cat1", name: "Laptop", products: 25 },
  { id: "cat2", name: "Desktop", products: 12 },
  { id: "cat3", name: "Monitor", products: 23 },
  { id: "cat4", name: "UPS", products: 9 },
  { id: "cat5", name: "Phone", products: 54 },
];

export const mockWarehouses = [
  { id: "wh1", name: "Kho Hà Nội", address: "123 Cầu Giấy" },
  { id: "wh2", name: "Kho Sài Gòn", address: "456 Bình Thạnh" },
];

export const mockProducts = [
  {
    id: "p1",
    name: "Macbook Pro 14",
    unit: "Cái",
    categoryId: "cat1",
    price: 1500,
    thumbnail: "/images/products/macbook.jpg",
    description: "Laptop hiệu năng cao dành cho dân thiết kế",
    origin: "Trung Quốc",
  },
  {
    id: "p2",
    name: "Dell XPS 15",
    unit: "Cái",
    categoryId: "cat1",
    price: 1200,
    thumbnail: "/images/products/dell.jpg",
    description: "Laptop văn phòng mỏng nhẹ",
    origin: "Mỹ",
  },
];

export const mockInventory = [
  { id: "inv1", productId: "p1", warehouseId: "wh1", quantity: 50 },
  { id: "inv2", productId: "p1", warehouseId: "wh2", quantity: 30 },
  { id: "inv3", productId: "p2", warehouseId: "wh1", quantity: 15 },
];

export const mockUsers = [
  {
    id: "u1",
    firstName: "John",
    lastName: "Doe",
    email: "john@admin.com",
    phone: "0909123456",
    designation: "Manager",
    roleId: "r1",
  },
  {
    id: "u2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@staff.com",
    phone: "0909987654",
    designation: "Staff",
    roleId: "r2",
  },
];