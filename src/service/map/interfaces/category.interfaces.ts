export interface Category {
  id: string; // SỬA: Đổi từ number sang string (vì Backend trả về UUID)
  title: string;
  img: string;
}