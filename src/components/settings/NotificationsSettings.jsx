import { Icon } from "@iconify/react";
import { SettingsHeader } from "./SettingsHeader";
import { useAppData } from "../../context/AppDataContext";

const TOGGLES = [
  { key: "push_enabled", label: "Push notifications", desc: "Points earned, rewards ready, and reminders", icon: "solar:bell-outline" },
  { key: "promo_emails", label: "Promotions & offers", desc: "New rewards, seasonal deals, and partner offers", icon: "solar:tag-outline" },
  { key: "order_updates", label: "Order updates", desc: "Status of orders placed at partner outlets", icon: "solar:bag-check-outline" },
  { key: "points_alerts", label: "Points alerts", desc: "Balance changes and expiring points", icon: "solar:cup-star-outline" },
];

export function NotificationsSettings() {
  const { notificationPrefs, updateNotificationPrefs } = useAppData();

  const toggle = (key) => {
    if (!notificationPrefs) return;
    updateNotificationPrefs({ [key]: !notificationPrefs[key] });
  };

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <SettingsHeader title="Notifications" />

      <div className="px-5 md:px-8 mt-6 max-w-lg">
        <div className="card bg-card border border-border shadow-sm overflow-hidden">
          <div className="divide-y divide-border">
            {TOGGLES.map(({ key, label, desc, icon }) => {
              const on = notificationPrefs?.[key] ?? false;
              return (
                <div key={key} className="flex items-center gap-4 p-5">
                  <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon icon={icon} className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{label}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary shrink-0"
                    checked={on}
                    onChange={() => toggle(key)}
                    aria-label={label}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
