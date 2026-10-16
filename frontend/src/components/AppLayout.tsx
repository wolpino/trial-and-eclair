import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { usePhoneLayout } from "../lib/usePhoneLayout";
import { FrameNav } from "./FrameNav";
import { HistoryNav } from "./HistoryNav";

function isPublicReadingPath(pathname: string): boolean {
  return pathname.startsWith("/r/") || pathname.startsWith("/c/");
}

export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isPhone = usePhoneLayout();
  // The phone box takes the whole screen; other phone pages keep the bottom bar (decision 003).
  const phoneBox = isPhone && /^\/recipe-box\/?$/.test(location.pathname);
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
        {phoneBox ? null : <FrameNav />}
        <div className="app-frame__body">
          {isPhone ? null : (
            <div className="app-frame__history">
              <HistoryNav />
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
