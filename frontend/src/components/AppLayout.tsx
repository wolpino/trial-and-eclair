import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { FrameNav } from "./FrameNav";
import { HistoryNav } from "./HistoryNav";

function isPublicReadingPath(pathname: string): boolean {
  return pathname.startsWith("/r/") || pathname.startsWith("/c/");
}

export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const showFrame = Boolean(user) && !isPublicReadingPath(location.pathname);

  if (!showFrame) {
    return (
      <div className="app-shell">
        <div className="app-public">
          <div className="app-public-brand">
            <Link className="app-brand" to="/">
              Trial and Eclair
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell app-shell--framed">
      <div className="app-frame">
        <FrameNav />
        <div className="app-frame__body">
          <div className="app-frame__history">
            <HistoryNav />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
