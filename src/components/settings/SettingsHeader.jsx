import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

export function SettingsHeader({ title }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-5 md:px-8 pt-6 pb-4 border-b border-border/40">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          aria-label="Back to profile"
          className="btn btn-circle btn-ghost btn-md border border-border bg-card shadow-sm"
        >
          <Icon icon="solar:arrow-left-outline" className="size-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
