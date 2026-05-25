const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ─── Auth helper ───
const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined"
      ? localStorage.getItem("access_token") || "": "";

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const apiFetch = async <T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${message}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
};
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  thumbnail: string;
  unit: string;
  categoryId?: string;
}

export interface Inventory {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
}

export interface Warehouse {
  id: string;
  name: string;
  address: string;
}

export interface Category {
  id: string;
  name: string;
  products?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
  perPage?: number;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  thumbnail?: string;
  unit?: string;
  categoryId?: string;
}

export const productApi = {
  getAll: (page = 1) =>
    apiFetch<PaginatedResponse<Product>>(`/products?page=${page}`),

  getByCategory: (page = 1, categoryId?: string) =>
    apiFetch<PaginatedResponse<Product>>(`/products?page=${page}${categoryId ? `&categoryId=${categoryId}` : ""}`),

  search: (name: string, page = 1) =>
    apiFetch<PaginatedResponse<Product>>(`/products/search?name=${encodeURIComponent(name)}&page=${page}`
    ),

  getById: (id: string) => apiFetch<Product>(`/products/${id}`),

  create: async (dto: CreateProductDto): Promise<Product> => {
      return apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    },
};

export const inventoryApi = {
  getAll: (page = 1) =>
    apiFetch<PaginatedResponse<Inventory>>(`/inventories?page=${page}`),
  getAllFlatten: async (maxPages = 20): Promise<Inventory[]> => {
    const all: Inventory[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await inventoryApi.getAll(page);
      all.push(...(res.data || []));
      lastPage = res.lastPage || 1;
      page++;
    } while (page <= lastPage && page <= maxPages);

    return all;
  },

  create: (dto: Partial<Inventory>) => apiFetch<Inventory>("/inventories", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: Partial<Inventory>) =>apiFetch<Inventory>(`/inventories/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/inventories/${id}`, { method: "DELETE" }),

  };

export const warehouseApi = {
  getAll: (page = 1) =>
    apiFetch<PaginatedResponse<Warehouse>>(`/warehouses?page=${page}`),

  getAllFlatten: async (maxPages = 20): Promise<Warehouse[]> => {
    const all: Warehouse[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await warehouseApi.getAll(page);
      all.push(...(res.data || []));
      lastPage = res.lastPage || 1;
      page++;
    } while (page <= lastPage && page <= maxPages);

    return all;
  },

  getById: (id: string) => apiFetch<Warehouse>(`/warehouses/${id}`),

  create: (dto: Partial<Warehouse>) =>
    apiFetch<Warehouse>("/warehouses", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  update: (id: string, dto: Partial<Warehouse>) =>
    apiFetch<Warehouse>(`/warehouses/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/warehouses/${id}`, { method: "DELETE" }),
};

export const categoryApi = {
  getAll: (page = 1) => apiFetch<PaginatedResponse<Category>>(`/categories?page=${page}`),
  getAllFlatten: async (maxPages = 20): Promise<Category[]> => {
    const all: Category[] = [];
    let page = 1;
    let lastPage = 1;

    do {
      const res = await categoryApi.getAll(page);
      all.push(...(res.data || []));
      lastPage = res.lastPage || 1;
      page++;
    } while (page <= lastPage && page <= maxPages);

    return all;
  },
};