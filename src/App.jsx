import { Routes, Route, Navigate } from "react-router-dom";

import { Home } from "./components/Home";
import { Rewards } from "./components/Rewards";
import { Products } from "./components/products";
import { Wallet } from "./components/Wallet";
import { Profile } from "./components/Profile";
import { Sidebar } from "./components/Sidebar";
import { ScrollControls } from "./components/Scroll";
import { PurchaseHistory } from "./components/PurchaseHistory";
import { NotificationsFeed } from "./components/notifications/NotificationsFeed";

import { Login } from "./components/auth/Login";
import { Signup } from "./components/auth/Signup";
// import { VerifyEmail } from "./components/auth/verifyEmail";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ForgotPassword from "./components/auth/ForgotPassword";

import { PersonalInformation } from "./components/settings/PersonalInformation";
import { PaymentMethods } from "./components/settings/PaymentMethods";
import { NotificationsSettings } from "./components/settings/NotificationsSettings";
import { PrivacySecurity } from "./components/settings/PrivacySecurity";
import { HelpSupport } from "./components/settings/HelpSupport";


function AppShell({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="relative mx-auto w-full max-w-[1200px] min-w-0 flex-1">
        {children}
      </div>

      <ScrollControls />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* <Route path="/verify-email" element={<VerifyEmail />} /> */}

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/"
          element={
            <AppShell>
              <Home />
            </AppShell>
          }
        />
        <Route
          path="/products"
          element={
            <AppShell>
              <Products />
            </AppShell>
          }
        />
        <Route
          path="/rewards"
          element={
            <AppShell>
              <Rewards />
            </AppShell>
          }
        />
        <Route
          path="/purchase-history"
          element={
            <AppShell>
              <PurchaseHistory />
            </AppShell>
          }
        />
        <Route
          path="/wallet"
          element={
            <AppShell>
              <Wallet />
            </AppShell>
          }
        />
        <Route
          path="/profile"
          element={
            <AppShell>
              <Profile />
            </AppShell>
          }
        />
        <Route
          path="/notifications"
          element={
            <AppShell>
              <NotificationsFeed />
            </AppShell>
          }
        />
        <Route
          path="/profile/personal-information"
          element={
            <AppShell>
              <PersonalInformation />
            </AppShell>
          }
        />
        <Route
          path="/profile/payment-methods"
          element={
            <AppShell>
              <PaymentMethods />
            </AppShell>
          }
        />
        <Route
          path="/profile/notifications"
          element={
            <AppShell>
              <NotificationsSettings />
            </AppShell>
          }
        />
        <Route
          path="/profile/privacy-security"
          element={
            <AppShell>
              <PrivacySecurity />
            </AppShell>
          }
        />
        <Route
          path="/profile/help-support"
          element={
            <AppShell>
              <HelpSupport />
            </AppShell>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}