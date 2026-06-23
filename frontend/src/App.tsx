import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DeveloperHomePage } from "./pages/DeveloperHomePage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PublicCookbookPage } from "./pages/PublicCookbookPage";
import { PublicRecipePage } from "./pages/PublicRecipePage";
import { RecipeBoxPage } from "./pages/RecipeBoxPage";
import { RegisterPage } from "./pages/RegisterPage";
import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/r/:slug" element={<PublicRecipePage />} />
        <Route path="/c/:slug" element={<PublicCookbookPage />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute requireDeveloper />}>
            <Route path="/developer" element={<DeveloperHomePage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/recipe-box" element={<RecipeBoxPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
