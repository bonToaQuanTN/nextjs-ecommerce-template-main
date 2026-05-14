"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/auth-slice";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        dispatch(setUser({ 
          id: payload.id, 
          email: payload.email, 
          role: payload.role 
        }));
      } catch (e) {
        console.error("Token invalid");
        localStorage.removeItem('access_token');
      }
    }
  }, [dispatch]);

  return <>{children}</>;
}