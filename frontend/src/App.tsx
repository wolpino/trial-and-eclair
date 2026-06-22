import { BrowserRouter, Route, Routes } from "react-router-dom";

import { HomePage } from "./pages/HomePage";
import { PublicRecipePage } from "./pages/PublicRecipePage";
import "./index.css";

export function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/r/:slug" element={<PublicRecipePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
