"use client"
import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function Home() {
  const { isAuthenticated,loading,logout } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);
  if (!isAuthenticated && loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="">
      <h1>Welcome to the Home Page</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
