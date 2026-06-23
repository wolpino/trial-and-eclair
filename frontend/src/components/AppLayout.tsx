import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export function AppLayout() {
  const { user, hasDeveloperAccess, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="app-brand" to="/">
            Trial and Eclair
          </Link>
          <nav className="app-nav" aria-label="Main">
            {user && hasDeveloperAccess ? (
              <NavLink
                to="/developer"
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                Cork board
              </NavLink>
            ) : null}
            {user && user.role === "home_cook" ? (
              <NavLink
                to="/recipe-box"
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                Recipe box
              </NavLink>
            ) : null}
            {user ? (
              <>
                <span className="nav-user">{user.username}</span>
                <button
                  type="button"
                  className="nav-button"
                  onClick={() => void handleLogout()}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
