import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { usePhoneLayout } from "../lib/usePhoneLayout";
import { FrameNav } from "./FrameNav";
import { BackToKitchen } from "./kitchen/BackToKitchen";
import { KitchenBackdrop } from "./kitchen/KitchenBackdrop";
import { useKitchenHome } from "./kitchen/useKitchenHome";

function isPublicReadingPath(pathname: string): boolean {
  return pathname.startsWith("/r/") || pathname.startsWith("/c/");
}

export function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isPhoneOrSideways = usePhoneLayout({ sideways: true });
  // The kitchen scene home goes full-bleed (decision 004).
  const kitchenHome = useKitchenHome();
  // The phone box takes the whole screen; other phone pages keep the bottom bar (decision 003).
  const phoneBox = isPhoneOrSideways && /^\/recipe-box\/?$/.test(location.pathname);
  // Visitors on the phone box get the same shell, so making a guest on the first
  // save doesn't remount the page and lose the save (#56).
  const showFrame = (Boolean(user) || phoneBox) && !isPublicReadingPath(location.pathname);

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

  // On wide screens every other signed-in page is a focused view over the
  // faded kitchen, with one "back to kitchen" instead of Back/Forward (decision 004).
  if (user && !isPhoneOrSideways && !kitchenHome) {
    return (
      <div className="app-shell app-shell--framed">
        <KitchenBackdrop />
        <div className="app-frame kitchen-view">
          <FrameNav />
          <div className="app-frame__body">
            <div className="kitchen-view__back">
              <BackToKitchen />
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell app-shell--framed">
      <div className={kitchenHome ? "app-frame app-frame--kitchen" : "app-frame"}>
        {phoneBox ? null : <FrameNav />}
        <div className="app-frame__body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
