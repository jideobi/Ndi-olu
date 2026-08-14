import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isWorker = user?.role === "worker";

  const navigationItems = isWorker
    ? [
        {
          label: "Dashboard",
          to: "/worker-dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Find Jobs",
          to: "/available-jobs",
          icon: Search,
        },
        {
          label: "My Proposals",
          to: "/worker-proposals",
          icon: BriefcaseBusiness,
        },
        {
          label: "Messages",
          to: "/messages",
          icon: MessageSquare,
        },
      ]
    : [
        {
          label: "Dashboard",
          to: "/customer-dashboard",
          icon: LayoutDashboard,
        },
        {
          label: "Find Workers",
          to: "/find-workers",
          icon: Search,
        },
        {
          label: "My Jobs",
          to: "/customer-jobs",
          icon: BriefcaseBusiness,
        },
        {
          label: "Messages",
          to: "/messages",
          icon: MessageSquare,
        },
      ];

  const secondaryItems = [
    {
      label: "Profile",
      to: "/profile",
      icon: UserRound,
    },
    {
      label: "Settings",
      to: "/settings",
      icon: Settings,
    },
  ];

  function handleLogout() {
    setIsSidebarOpen(false);
    logout();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link
            to="/"
            onClick={() => setIsSidebarOpen(false)}
            className="text-2xl font-extrabold tracking-[-0.06em] text-ndi-forest"
          >
            Ndi<span className="text-ndi-orange">-</span>Olu
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User summary */}
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ndi-forest text-sm font-extrabold text-white">
              {user?.full_name?.charAt(0)?.toUpperCase() || "N"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {user?.full_name || "Ndi-Olu User"}
              </p>

              <p className="mt-0.5 text-xs capitalize text-slate-500">
                {user?.role || "customer"}
              </p>
            </div>

            <ChevronDown
              size={16}
              className="ml-auto shrink-0 text-slate-400"
            />
          </div>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Workspace
          </p>

          <div className="mt-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-emerald-50 text-ndi-forest"
                        : "text-slate-600 hover:bg-slate-50 hover:text-ndi-forest"
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <p className="mt-8 px-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
            Account
          </p>

          <div className="mt-3 space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-emerald-50 text-ndi-forest"
                        : "text-slate-600 hover:bg-slate-50 hover:text-ndi-forest"
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main application area */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={21} />
          </button>

          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-500">
              {isWorker
                ? "Your professional workspace"
                : "Your Ndi-Olu workspace"}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-ndi-forest"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-ndi-orange" />
            </button>

            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-50"
            >
              <div className="grid h-9 w-9 place-items-center rounded-full bg-ndi-forest text-xs font-extrabold text-white">
                {user?.full_name?.charAt(0)?.toUpperCase() || "N"}
              </div>

              <span className="hidden max-w-32 truncate text-sm font-bold text-slate-700 sm:block">
                {user?.full_name}
              </span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;