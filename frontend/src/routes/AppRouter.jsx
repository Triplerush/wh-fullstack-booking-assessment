import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

import { AppShell } from "../components/layout/AppShell";
import { AuthProvider } from "../context/AuthContext";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { MyBookingsPage } from "../pages/MyBookingsPage";
import { RegisterPage } from "../pages/RegisterPage";
import { RequireAuth } from "./RequireAuth";

function ShellLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<ShellLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/me/bookings" element={<MyBookingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
