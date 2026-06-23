import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import { GuestRoute } from "./components/GuestRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CookbookDetailPage } from "./pages/CookbookDetailPage";
import { CookbooksPage } from "./pages/CookbooksPage";
import { DeveloperHomePage } from "./pages/DeveloperHomePage";
import { DeveloperLabPage } from "./pages/DeveloperLabPage";
import { DeveloperRecipePage } from "./pages/DeveloperRecipePage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { PublicCookbookPage } from "./pages/PublicCookbookPage";
import { PublicRecipePage } from "./pages/PublicRecipePage";
import { RecipeBoxPage } from "./pages/RecipeBoxPage";
import { ReferencesPage } from "./pages/ReferencesPage";
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
            <Route path="/developer/lab" element={<DeveloperLabPage />} />
            <Route path="/developer/lab/:recipeId" element={<DeveloperRecipePage />} />
            <Route path="/developer/cookbooks" element={<CookbooksPage />} />
            <Route
              path="/developer/cookbooks/:cookbookId"
              element={<CookbookDetailPage />}
            />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/recipe-box" element={<RecipeBoxPage />} />
            <Route path="/recipe-box/:recipeId" element={<RecipeBoxPage />} />
            <Route path="/references" element={<ReferencesPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
