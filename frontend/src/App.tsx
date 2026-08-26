import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrganizationsListPage from "./pages/OrganizationsListPage";
import OrganizationDetailPage from "./pages/OrganizationDetailPage";
import StaffCreateOrganizationPage from "./pages/StaffCreateOrganizationPage";
import StaffManageServicesPage from "./pages/StaffManageServicesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/organizations" element={<OrganizationsListPage />} />
        <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
        <Route path="/staff/create-organization" element={<StaffCreateOrganizationPage />} />
        <Route path="/staff/organizations/:id/services" element={<StaffManageServicesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;