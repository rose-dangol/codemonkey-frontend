import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import NotFound from "./pages/auth/NotFound";
import Register from "./pages/auth/Register";
import Homepage from "./pages/RenderPages/Homepage";
import AppLayout from "./Layout/AppLayout";
import Category from "./pages/RenderPages/Category";
import Brands from "./pages/RenderPages/Brands";


const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Homepage />} />
        <Route path="/ordermgmt/category" element={<Category />} />
        <Route path="/ordermgmt/brands" element={<Brands />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default Router;
