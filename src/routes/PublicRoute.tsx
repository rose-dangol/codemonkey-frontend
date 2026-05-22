import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const PublicRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#212121] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#b7d4ff]" />
          <p className="text-sm font-medium tracking-wide text-[#E0E0E0]">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to={"/dashboard"} /> : <Outlet />;
};

export default PublicRoutes;
