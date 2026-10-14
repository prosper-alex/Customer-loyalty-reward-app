import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../../context/AppDataContext";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsFeed() {
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteReadNotifications,
  } = useAppData();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl px-5 md:px-8 pt-6 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="btn btn-circle btn-ghost btn-md border border-border bg-card shadow-sm"
            >
              <Icon
                icon="solar:arrow-left-outline"
                className="size-5 text-black"
              />
            </button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Notifications
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="btn btn-ghost btn-sm text-primary font-bold hover:bg-primary/10"
              >
                Mark all read
              </button>
            )}

            {readCount > 0 && (
              <button
                type="button"
                onClick={deleteReadNotifications}
                className="btn btn-ghost btn-sm text-muted-foreground font-bold hover:bg-muted"
              >
                Delete all read
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-5 md:px-8 mt-6 max-w-2xl">
        {notifications.length === 0 ? (
          <div className="card bg-card border border-border shadow-sm">
            <div className="card-body p-10 items-center text-center">
              <Icon
                icon="solar:bell-outline"
                className="size-10 text-muted-foreground mb-2"
              />
              <p className="font-bold">You're all caught up</p>
              <p className="text-sm text-muted-foreground mt-1">
                No notifications yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => !n.isRead && markNotificationRead(n._id)}
                className={`w-full text-left flex items-start gap-4 p-5 rounded-xl border transition-colors ${
                  n.isRead
                    ? "bg-card border-border"
                    : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon icon="solar:bell-bold" className="size-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm md:text-base">{n.title}</p>

                    {!n.isRead && (
                      <span className="size-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>

                  {n.body && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {n.body}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
