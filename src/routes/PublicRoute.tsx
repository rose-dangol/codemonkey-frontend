import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PublicRoutes = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to={"/home"} /> : <Outlet />;
};

export default PublicRoutes;
