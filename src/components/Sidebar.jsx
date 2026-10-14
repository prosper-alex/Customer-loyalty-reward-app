import { Icon } from "@iconify/react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";

export const NAV_ITEMS = [
  {
    to: "/",
    end: true,
    label: "Dashboard",
    shortLabel: "Home",
    icon: "solar:home-2-outline",
    activeIcon: "solar:home-2-bold",
  },
  {
    to: "/products",
    label: "Products",
    shortLabel: "Products",
    icon: "solar:bag-4-outline",
    activeIcon: "solar:bag-4-bold",
  },

  {
  to: "/purchase-history",
  label: "Purchase History",
  shortLabel: "Purchases",
  icon: "solar:document-text-outline",
  activeIcon: "solar:document-text-bold",
  },
  {
    to: "/rewards",
    label: "Rewards",
    shortLabel: "Rewards",
    icon: "solar:cup-star-outline",
    activeIcon: "solar:cup-star-bold",
  },
  {
    to: "/wallet",
    label: "Wallet & Pass",
    shortLabel: "Wallet",
    icon: "solar:wallet-outline",
    activeIcon: "solar:wallet-bold",
  },
  {
    to: "/profile",
    label: "Profile",
    shortLabel: "Profile",
    icon: "solar:user-circle-outline",
    activeIcon: "solar:user-circle-bold",
  },
];

export function Sidebar() {
  const { signOut } = useAuth();
  const { profile } = useAppData();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-card sticky top-0 md:flex">
      <div className="flex items-center gap-3 p-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
          <Icon icon="solar:crown-star-bold" className="size-6" />
        </div>

        <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
          LoyaltyApp
        </h1>
      </div>

      <nav
        className="mt-2 flex-1 space-y-1.5 px-4"
        aria-label="Primary navigation"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 font-bold text-primary shadow-sm"
                  : "font-semibold text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  icon={isActive ? item.activeIcon : item.icon}
                  className="size-5"
                />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-3 border-t border-border/50 p-4">
        <div className="rounded-[1.25rem] border border-border/50 bg-muted/30 p-4 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Total Earned Points
          </p>

          <div className="mb-1 flex justify-center">
            <Icon
              icon="solar:star-bold"
              className="size-6 text-primary"
            />
          </div>

          <p className="font-heading text-lg font-bold text-foreground">
            {(profile?.totalPointsEarned ?? 0).toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            points earned
          </p>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary"
        >
          <Icon icon="solar:logout-3-outline" className="size-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 pb-5 pt-3 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-md items-center justify-around">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  icon={isActive ? item.activeIcon : item.icon}
                  className="size-6"
                />

                <span
                  className={`text-[10px] ${
                    isActive ? "font-bold" : "font-semibold"
                  }`}
                >
                  {item.shortLabel}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}