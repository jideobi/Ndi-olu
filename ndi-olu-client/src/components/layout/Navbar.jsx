import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigationItems = [
  { label: "Find workers", href: "#services" },
  { label: "How it works", href: "#how-it-works" },
  { label: "For professionals", href: "#for-workers" },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
    setIsMenuOpen(false);
  }

  const dashboardPath =
    user?.role === "worker"
      ? "/worker-dashboard"
      : "/customer-dashboard";

  return (
    <>
      <div className="border-b border-emerald-950/10 bg-ndi-forest px-5 py-2.5 text-center text-xs font-medium text-emerald-50 sm:text-sm">
        Ndi-Olu is building a trusted skilled-services marketplace for Enugu
        State.
      </div>

      <header className="border-b border-slate-200/80 bg-ndi-sand/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/"
            className="text-2xl font-extrabold tracking-[-0.06em] text-ndi-forest"
            aria-label="Ndi-Olu home"
          >
            Ndi<span className="text-ndi-orange">-</span>Olu
          </Link>

          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Primary navigation"
          >
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-slate-600 transition hover:text-ndi-forest"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop authentication area */}
          <div className="hidden items-center gap-4 lg:flex">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 transition hover:text-ndi-forest"
                >
                  Sign in
                </Link>

                <Link
                  to="/signup?role=worker"
                  className="rounded-lg bg-ndi-forest px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-ndi-forest-dark"
                >
                  Join as a worker
                </Link>
              </>
            ) : (
              <>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500">
                    Welcome back
                  </p>

                  <p className="max-w-32 truncate text-sm font-bold text-ndi-forest">
                    {user?.full_name}
                  </p>
                </div>

                <Link
                  to={dashboardPath}
                  className="rounded-lg border border-ndi-forest px-4 py-2.5 text-sm font-bold text-ndi-forest transition hover:bg-emerald-50"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm font-semibold text-slate-600 transition hover:text-red-600"
                >
                  Sign out
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-ndi-forest transition hover:border-ndi-forest lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">
            <nav
              className="mx-auto flex max-w-7xl flex-col gap-1"
              aria-label="Mobile navigation"
            >
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-ndi-forest"
                >
                  {item.label}
                </a>
              ))}

              <div className="mt-3 border-t border-slate-100 pt-4">
                {!isAuthenticated ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-lg border border-slate-300 px-4 py-3 text-center text-sm font-bold text-slate-700"
                    >
                      Sign in
                    </Link>

                    <Link
                      to="/signup?role=worker"
                      onClick={() => setIsMenuOpen(false)}
                      className="rounded-lg bg-ndi-forest px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      Join Ndi-Olu
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-xl bg-emerald-50 p-4">
                      <p className="text-xs font-medium text-slate-500">
                        Signed in as
                      </p>

                      <p className="mt-1 font-bold text-ndi-forest">
                        {user?.full_name}
                      </p>

                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {user?.role}
                      </p>
                    </div>

                    <Link
                      to={dashboardPath}
                      onClick={() => setIsMenuOpen(false)}
                      className="block rounded-lg bg-ndi-forest px-4 py-3 text-center text-sm font-bold text-white"
                    >
                      Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-bold text-red-600"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export default Navbar;