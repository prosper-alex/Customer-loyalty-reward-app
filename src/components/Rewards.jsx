import { useState } from "react";
import { Icon } from "@iconify/react";
import { MobileNav } from "./Sidebar";
import { useAppData } from "../context/AppDataContext";

export function Rewards() {
  const { profile, rewards, redeemReward } = useAppData();

  const [busyId, setBusyId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const points = profile?.pointsBalance ?? 0;

  const handleRedeem = async (rewardId) => {
    setFeedback(null);
    setBusyId(rewardId);

    const { error } = await redeemReward(rewardId);

    setBusyId(null);

    if (error) {
      setFeedback({
        type: "error",
        message: error.message,
      });

      return;
    }

    setFeedback({
      type: "success",
      message: "Your reward has been redeemed successfully.",
    });
  };

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <header className="px-5 md:px-8 pt-6 pb-6 border-b border-border/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Rewards
            </h1>

            <p className="text-muted-foreground mt-2">
              Use your points to redeem rewards.
            </p>
          </div>

          <div className="badge badge-lg bg-primary/10 text-primary border-none font-bold px-5 py-4">
            {points.toLocaleString()} pts
          </div>
        </div>
      </header>

      <div className="px-5 md:px-8 py-8">
        {rewards.length === 0 ? (
          <div className="text-center py-16">
            <Icon
              icon="solar:cup-star-outline"
              className="size-16 mx-auto text-muted-foreground mb-4"
            />

            <h2 className="text-xl font-semibold">
              No rewards available
            </h2>

            <p className="text-muted-foreground mt-2">
              There are currently no rewards available for redemption.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const canRedeem =
                points >= reward.pointsRequired &&
                reward.quantity > 0 &&
                reward.isAvailable;

              return (
                <div
                  key={reward._id}
                  className="card bg-card border border-border shadow-sm"
                >
                  <div className="card-body p-6">
                    <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                      <Icon
                        icon="solar:cup-star-outline"
                        className="size-7 text-primary"
                      />
                    </div>

                    <h2 className="card-title">
                      {reward.name}
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1">
                      {reward.description}
                    </p>

                    <div className="mt-5">
                      <p className="text-2xl font-bold text-primary">
                        {reward.pointsRequired.toLocaleString()} pts
                      </p>

                      <p className="text-sm text-muted-foreground mt-1">
                        {reward.quantity} available
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!canRedeem || busyId === reward._id}
                      onClick={() => handleRedeem(reward._id)}
                      className="btn btn-dark w-full mt-6 disabled:opacity-50"
                    >
                      {busyId === reward._id
                        ? "Redeeming..."
                        : !reward.isAvailable
                        ? "Unavailable"
                        : reward.quantity <= 0
                        ? "Out of stock"
                        : points < reward.pointsRequired
                        ? "Not enough points"
                        : "Redeem"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Redemption Feedback */}
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div
            role="alert"
            className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 text-center shadow-xl"
          >
            <div
              className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-full ${
                feedback.type === "success"
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              <Icon
                icon={
                  feedback.type === "success"
                    ? "solar:check-circle-bold"
                    : "solar:danger-circle-bold"
                }
                className={`size-7 ${
                  feedback.type === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
            </div>

            <h3 className="text-lg font-bold">
              {feedback.type === "success"
                ? "Reward Redeemed"
                : "Redemption Failed"}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {feedback.message}
            </p>

            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="btn btn-dark mt-5 w-full text-white"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      <MobileNav />
    </main>
  );
}