import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrganizationsListPage from "./pages/OrganizationsListPage";
import OrganizationDetailPage from "./pages/OrganizationDetailPage";
import StaffCreateOrganizationPage from "./pages/StaffCreateOrganizationPage";
import StaffManageServicesPage from "./pages/StaffManageServicesPage";
import CustomerDashboardPage from "./pages/CustomerDashboardPage";
import StaffDashboardPage from "./pages/StaffDashboardPage";
import StaffQueueControlPage from "./pages/StaffQueueControlPage";
import StaffAnalyticsPage from "./pages/StaffAnalyticsPage";
import RecommendationSearchPage from "./pages/RecommendationSearchPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/organizations" element={<OrganizationsListPage />} />
          <Route
            path="/organizations/:id"
            element={<OrganizationDetailPage />}
          />

          {/* Recommendation Search */}
          <Route
            path="/recommendations"
            element={<RecommendationSearchPage />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="CUSTOMER">
                <CustomerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute role="STAFF">
                <StaffDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/create-organization"
            element={
              <ProtectedRoute role="STAFF">
                <StaffCreateOrganizationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/organizations/:id/services"
            element={
              <ProtectedRoute role="STAFF">
                <StaffManageServicesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/queues/:id"
            element={
              <ProtectedRoute role="STAFF">
                <StaffQueueControlPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/queues/:id/analytics"
            element={
              <ProtectedRoute role="STAFF">
                <StaffAnalyticsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;