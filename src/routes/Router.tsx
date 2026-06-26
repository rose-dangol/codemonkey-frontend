import { Navigate, Route, Routes } from "react-router-dom";
import PublicRoutes from "./PublicRoute";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import EmailCheck from "@/pages/EmailCheck";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "@/Layout/AppLayout";
import Homepage from "@/pages/RenderPages/Homepage";
import Brands from "@/pages/RenderPages/Brands";
import Category from "@/pages/RenderPages/Category";
import Product from "@/pages/RenderPages/Product";
import ProductVariant from "@/pages/RenderPages/ProductVariant";
import AttributeDefinitions from "@/pages/RenderPages/AttributeDefinitions";
import CogsDefinitions from "@/pages/RenderPages/CogsDefinition";
import NotFound from "@/pages/Fallback";
import Dashboard from "../pages/RenderPages/Dashboard";
import OrderAnalytics from "@/pages/RenderPages/OrderAnalytics";
import OrderDetail from "@/pages/DetailPages/OrderDetail";
import InventoryManagement from "@/pages/RenderPages/InventoryManagement";
import Tags from "@/pages/RenderPages/Tags";
import InventoryVariantDetail from "@/pages/DetailPages/InventoryVariantDetail";
import InventoryTransactionHistory from "@/pages/RenderPages/InventoryTransactionHistory";
import StockStatusManagement from "@/pages/RenderPages/StockStatusManagement";
import GeneralPage from "@/pages/NavigationItem/GeneralPage";
import GeneralPageCreate from "@/pages/NavigationItem/GeneralPageCreate";
import NavigationItem from "@/pages/NavigationItem/NavigationItem";
import ProductDetailPage from "@/pages/DetailPages/ProductDetail";
import DeliveryCharge from "@/pages/RenderPages/DeliveryCharge";


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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/home" element={<Homepage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ordermgmt/overview" element={<OrderAnalytics />} />
          <Route path="/ordermgmt/category" element={<Category />} />
          <Route path="/ordermgmt/brands" element={<Brands />} />
          <Route path="/ordermgmt/products" element={<Product />} />
          <Route path="/ordermgmt/tags" element={<Tags />} />
          <Route path="/pagmgmt/general" element={<GeneralPage />} />
          <Route path="/product/view/:id" element={<ProductDetailPage />} />
          <Route path="/generalPage/create" element={<GeneralPageCreate />} />
          <Route
            path="/ordermgmt/deliverycharge"
            element={<DeliveryCharge />}
          />
          <Route
            path="/generalPage/update/:id"
            element={<GeneralPageCreate />}
          />
          <Route path="/pagmgmt/navigationitem" element={<NavigationItem />} />

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/ordermgmt/orderanalytics"
            element={<OrderAnalytics />}
          />
          <Route path="/order/detail/:id" element={<OrderDetail />} />

          <Route path="/inventory/overview" element={<InventoryManagement />} />
          <Route
            path="/inventory/variant/:id"
            element={<InventoryVariantDetail />}
          />
          <Route
            path="/inventory/transactions"
            element={<InventoryTransactionHistory />}
          />
          <Route
            path="/inventory/stock-statuses"
            element={<StockStatusManagement />}
          />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
