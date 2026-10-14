import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "./Sidebar";
import { useAppData } from "../context/AppDataContext";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);

  if (hours < 24) {
    return `Today, ${new Date(dateStr).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) return "Yesterday";

  return `${days}d ago`;
}

export function Home() {
  const navigate = useNavigate();

  const [showStickyUserBar, setShowStickyUserBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyUserBar(window.scrollY > 250);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const {
    profile,
    rewards,
    featuredRewards,
    pointsHistory,
    purchases,
    redemptions,
    notifications,
  } = useAppData();

  const points = profile?.pointsBalance ?? 0;

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;
  const totalPointsEarned = profile?.totalPointsEarned ?? 0;

  const isPlatinum = totalPointsEarned >= 20000;
  const tier = isPlatinum ? "Platinum" : "Gold";

  const nextGoal = 20000;

  const toNextTier = isPlatinum ? 0 : Math.max(nextGoal - totalPointsEarned, 0);

  const progressPct = isPlatinum
    ? 100
    : Math.min(Math.round((totalPointsEarned / nextGoal) * 100), 100);
  const handleInviteFriend = async () => {
    const referralCode = profile?.referralCode;

    if (!referralCode) {
      return;
    }

    const signupUrl = `${window.location.origin}/signup?ref=${referralCode}`;

    const shareData = {
      title: "Join Customer Loyalty App",
      text: "Join me on Customer Loyalty App and start earning loyalty points.",
      url: signupUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(signupUrl);

      alert(
        "Your referral link has been copied. You can now paste it into WhatsApp or any messaging app.",
      );
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Unable to share referral link:", error);
      }
    }
  };

  /*
   * Recent activity is built from:
   * - points history
   * - redemptions
   *
   * Purchases are intentionally not added separately because
   * a successful purchase already creates an "Earned" point
   * transaction. Adding both would duplicate the same activity.
   */
  const activity = [
    ...pointsHistory.map((entry) => ({
      id: `point-${entry._id}`,
      title: entry.type === "EARN" ? "Points earned" : "Points redeemed",
      created_at: entry.createdAt,
      points_delta:
        entry.type === "EARN"
          ? Math.abs(entry.points)
          : -Math.abs(entry.points),
    })),

    ...redemptions.map((redemption) => ({
      id: `redemption-${redemption._id}`,
      title: `Redeemed ${redemption.rewardName}`,
      created_at: redemption.createdAt,
      points_delta: -Math.abs(redemption.pointsUsed),
    })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const availableRewards = rewards
    .filter(
      (reward) => reward.isAvailable && reward.quantity > 0,
      // && !reward.featured,
    )
    .slice(0, 3);

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      {showStickyUserBar && (
        <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="px-5 md:px-8 py-3 flex items-center justify-between gap-4">
            {/* User */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                {profile?.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt={`${profile.firstName} profile`}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {profile?.firstName?.charAt(0)?.toUpperCase()}
                    {profile?.lastName?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="font-semibold truncate">
                  {profile?.firstName} {profile?.lastName}
                </p>

                <div className="flex items-center gap-1.5">
                  <Icon
                    icon="solar:crown-star-bold"
                    className="size-3.5 text-primary"
                  />
                  <span className="text-xs text-muted-foreground">
                    {tier} Member
                  </span>
                </div>
              </div>
            </div>

            {/* Points */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Notifications */}
              <button
                type="button"
                onClick={() => navigate("/notifications")}
                aria-label="Notifications"
                className="relative size-10 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Icon icon="solar:bell-outline" className="size-5" />

                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Points */}
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Points</p>
                <p className="font-bold text-primary">
                  {points.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="px-5 md:px-8 pt-6 pb-8 space-y-8">
        {/* PROFILE BANNER */}
        <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 md:p-8 text-primary-foreground shadow-sm">
          <div className="absolute -right-16 -top-16 size-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-20 size-64 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => navigate("/notifications")}
                aria-label="Notifications"
                className="relative size-11 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              >
                <Icon icon="solar:bell-outline" className="size-5" />

                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center">
                    {unreadNotificationCount > 99
                      ? "99+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <div className="size-16 md:size-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0 border-2 border-white/30">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={`${profile.firstName} profile`}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl font-bold">
                      {profile?.firstName?.charAt(0)?.toUpperCase()}
                      {profile?.lastName?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-primary-foreground/70">
                    Welcome back
                  </p>

                  <h1 className="text-2xl md:text-3xl font-bold mt-1">
                    {profile?.firstName} {profile?.lastName}
                  </h1>

                  <div className="flex items-center gap-2 mt-2">
                    <Icon icon="solar:crown-star-bold" className="size-4" />

                    <span className="text-sm font-medium">{tier} Member</span>
                  </div>
                </div>
              </div>

              {/* Available Points */}
              <div className="md:text-right">
                <p className="text-sm text-primary-foreground/70">
                  Available Points
                </p>

                <p className="text-4xl md:text-5xl font-bold mt-1">
                  {points.toLocaleString()}
                </p>

                <p className="text-sm text-primary-foreground/70 mt-1">
                  points available
                </p>
              </div>
            </div>

            {/* Platinum Progress */}
            <div className="mt-7 border-t border-white/15 pt-5">
              <div className="flex items-center justify-between mb-2 max-w-xl">
                <p className="text-sm font-medium">
                  {isPlatinum
                    ? "Platinum reached"
                    : `${toNextTier.toLocaleString()} points to Platinum`}
                </p>

                <span className="text-sm font-semibold">{progressPct}%</span>
              </div>

              <div className="h-2 w-full max-w-xl rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex justify-between max-w-xl mt-2 text-xs text-primary-foreground/60">
                <span>{totalPointsEarned.toLocaleString()} earned</span>

                <span>{nextGoal.toLocaleString()} pts</span>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Quick Actions</h2>

            <p className="text-sm text-muted-foreground mt-1">
              Manage your loyalty account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Shop */}
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="text-left rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon
                  icon="solar:bag-4-outline"
                  className="size-6 text-primary"
                />
              </div>

              <h3 className="font-bold text-lg">Shop Products</h3>

              <p className="text-sm text-muted-foreground mt-2">
                Browse products and earn points from your purchases.
              </p>

              <span className="inline-block text-sm text-primary font-medium mt-4">
                Start shopping →
              </span>
            </button>

            {/* Rewards */}
            <button
              type="button"
              onClick={() => navigate("/rewards")}
              className="text-left rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 hover:scale-[1.02] hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon
                  icon="solar:cup-star-outline"
                  className="size-6 text-primary"
                />
              </div>

              <h3 className="font-bold text-lg">Redeem Rewards</h3>

              <p className="text-sm text-muted-foreground mt-2">
                Use your points to redeem available rewards.
              </p>

              <span className="inline-block text-sm text-primary font-medium mt-4">
                View rewards →
              </span>
            </button>

            {/* Invite */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon
                  icon="solar:users-group-rounded-outline"
                  className="size-6 text-primary"
                />
              </div>

              <h3 className="font-bold text-lg">Invite a Friend</h3>

              <p className="text-sm text-muted-foreground mt-2">
                Share the loyalty program with your friends and enjoy more
                benefits together.
              </p>

              <button
                type="button"
                onClick={handleInviteFriend}
                className="btn btn-dark mt-4 text-white cursor-pointer"
                disabled={!profile?.referralCode}
              >
                <Icon icon="solar:share-outline" className="size-5" />
                Invite Friend
              </button>

              <p className="text-xs text-muted-foreground mt-2">
                Referral and earn points.
              </p>
            </div>
          </div>
        </section>

        {/* FEATURED REWARDS */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Featured Rewards</h2>

            <p className="text-sm text-muted-foreground mt-1">
              Popular rewards you can redeem with your points.
            </p>
          </div>

          {featuredRewards.length === 0 ? (
            <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200">
              <Icon
                icon="solar:star-outline"
                className="size-12 mx-auto text-muted-foreground mb-3"
              />

              <h3 className="font-semibold">No featured rewards</h3>

              <p className="text-sm text-muted-foreground mt-1">
                Check back later for featured rewards.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredRewards.slice(0, 3).map((reward) => (
                <div
                  key={reward._id}
                  className="rounded-2xl border border-primary/20 bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon
                        icon="solar:star-bold"
                        className="size-6 text-primary"
                      />
                    </div>

                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Featured
                    </span>
                  </div>

                  <h3 className="font-bold text-lg">{reward.name}</h3>

                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {reward.description}
                  </p>

                  <div className="flex items-center justify-between mt-5">
                    <span className="font-bold text-primary">
                      {reward.pointsRequired.toLocaleString()} pts
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {reward.quantity} available
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/rewards")}
                    className="btn btn-dark text-white w-full mt-5"
                  >
                    View Reward
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AVAILABLE REWARDS */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Available Rewards</h2>

            <p className="text-sm text-muted-foreground mt-1">
              Rewards you can redeem with your points.
            </p>
          </div>

          {availableRewards.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:scale-[1.02] hover:shadow-md transition-all duration-200">
              <Icon
                icon="solar:cup-star-outline"
                className="size-12 mx-auto text-muted-foreground mb-3"
              />

              <h3 className="font-semibold">No rewards available</h3>

              <p className="text-sm text-muted-foreground mt-1">
                Check back later for new rewards.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {availableRewards.map((reward) => (
                <div
                  key={reward._id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon
                      icon="solar:cup-star-outline"
                      className="size-6 text-primary"
                    />
                  </div>

                  <h3 className="font-bold text-lg">{reward.name}</h3>

                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {reward.description}
                  </p>

                  <div className="flex items-center justify-between mt-5">
                    <span className="font-bold text-primary">
                      {reward.pointsRequired.toLocaleString()} pts
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {reward.quantity} available
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RECENT ACTIVITY */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Recent Activity</h2>

            <p className="text-sm text-muted-foreground mt-1">
              Your latest loyalty activity.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {activity.length === 0 ? (
              <div className="p-8 text-center">
                <Icon
                  icon="solar:history-outline"
                  className="size-12 mx-auto text-muted-foreground mb-3"
                />

                <h3 className="font-semibold">No recent activity</h3>

                <p className="text-sm text-muted-foreground mt-1">
                  Your purchases and points activity will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activity.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="size-10 shrink-0 rounded-xl bg-muted flex items-center justify-center">
                        <Icon
                          icon={
                            item.points_delta >= 0
                              ? "solar:arrow-up-outline"
                              : "solar:arrow-down-outline"
                          }
                          className={`size-5 ${
                            item.points_delta >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.title}</p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {timeAgo(item.created_at)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`font-bold whitespace-nowrap ${
                        item.points_delta >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.points_delta >= 0 ? "+" : ""}
                      {item.points_delta.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* POINTS WALLET */}
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon
                  icon="solar:wallet-money-outline"
                  className="size-6 text-primary"
                />
              </div>

              <div>
                <h2 className="font-bold text-lg">Your Points Wallet</h2>

                <p className="text-sm text-muted-foreground mt-1">
                  You currently have{" "}
                  <span className="font-semibold text-foreground">
                    {points.toLocaleString()} points
                  </span>{" "}
                  available.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/wallet")}
              className="btn btn-dark text-white"
            >
              View Points
            </button>
          </div>
        </section>
      </div>

      <MobileNav />
    </main>
  );
}
