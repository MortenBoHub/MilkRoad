import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AdminView } from "@/views/AdminView";
import { CreateListingView } from "@/views/CreateListingView";
import { LandingView } from "@/views/LandingView";
import { LoginView } from "@/views/LoginView";
import { OrdersView } from "@/views/OrdersView";
import "./index.css";

/** Routing only: this file maps URLs to views, nothing else. */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/sell" element={<CreateListingView />} />
        <Route path="/orders" element={<OrdersView />} />
        <Route path="/admin" element={<AdminView />} />
        {/* Unknown URLs fall back to the landing page. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
