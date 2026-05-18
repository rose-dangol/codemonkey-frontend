import { Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Homepage from "./pages/RenderPages/Homepage";
import AppLayout from "./Layout/AppLayout";
import Category from "./pages/RenderPages/Category";
import Brands from "./pages/RenderPages/Brands";
import Product from "./pages/RenderPages/Product";
import ProductVariant from "./pages/RenderPages/ProductVariant";
import ProtectedRoute from "./ProtectedRoute";
import EmailCheck from "./pages/EmailCheck";
import AttributeDefinitions from "./pages/RenderPages/AttributeDefinitions";
import CogsDefinitions from "./pages/RenderPages/CogsDefinition";
import NotFound from "./pages/Fallback";
import PublicRoutes from "./PublicRoute";

const Router = () => {
  return (
    <Routes>
      <Route element={<PublicRoutes />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/email" element={<EmailCheck />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Homepage />} />
          <Route path="/ordermgmt/category" element={<Category />} />
          <Route path="/ordermgmt/brands" element={<Brands />} />
          <Route path="/ordermgmt/products" element={<Product />} />
          <Route
            path="/ordermgmt/productvariant"
            element={<ProductVariant />}
          />
          <Route
            path="/ordermgmt/attributedeinitions"
            element={<AttributeDefinitions />}
          />
          <Route
            path="/ordermgmt/cogsdefinitions"
            element={<CogsDefinitions />}
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
