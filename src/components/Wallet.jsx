import { useState } from "react";
import { Icon } from "@iconify/react";
import { MobileNav } from "./Sidebar";
import { useAppData } from "../context/AppDataContext";

function formatDate(dateString) {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Wallet() {
  const { profile, pointsHistory, redemptions, loading } = useAppData();

  const points = profile?.pointsBalance ?? 0;

  const [selectedPoint, setSelectedPoint] = useState(null);

  const [selectedRedemption, setSelectedRedemption] = useState(null);

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      {/* Header */}
      <header className="px-5 md:px-8 pt-6 pb-6 border-b border-border/40">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Wallet
        </h1>

        <p className="text-muted-foreground mt-2">
          View your points balance and loyalty history.
        </p>
      </header>

      <div className="px-5 md:px-8 py-8 space-y-10">
        {/* Points Balance */}
        <section className="card bg-dark text-white shadow-xl">
          <div className="card-body p-8">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Icon icon="solar:wallet-money-outline" className="size-7" />
              </div>

              <div>
                <p className="text-sm text-white/60">Current points balance</p>

                <p className="text-4xl font-bold mt-1">
                  {points.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Points History */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Points history</h2>

            <p className="text-sm text-muted-foreground mt-1">
              Your points earned and spent.
            </p>
          </div>

          <div className="card bg-card border border-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-10">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : pointsHistory.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No points history yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pointsHistory.map((entry) => {
                  const rawPoints = Math.abs(entry.points ?? 0);

                  const isRedeemed = entry.type?.toLowerCase() === "redeemed";

                  const pointsChange = isRedeemed ? -rawPoints : rawPoints;

                  return (
                    <div
                      key={entry._id}
                      onClick={() => setSelectedPoint(entry)}
                      className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
                            isRedeemed
                              ? "bg-red-100 text-red-600"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <Icon
                            icon={
                              isRedeemed
                                ? "solar:arrow-down-outline"
                                : "solar:star-outline"
                            }
                            className="size-5"
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold">
                            {entry.description ||
                              (isRedeemed
                                ? "Points redeemed"
                                : "Points earned")}
                          </p>

                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(entry.createdAt)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-bold shrink-0 ${
                          pointsChange >= 0 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {pointsChange >= 0 ? "+" : ""}
                        {pointsChange.toLocaleString()} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {selectedPoint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Points transaction
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Transaction details
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPoint(null)}
                  className="btn btn-sm btn-circle bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  aria-label="Close transaction details"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-5">
                {/* Points */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Points</p>

                  <p
                    className={`text-3xl font-bold mt-1 ${
                      selectedPoint.type?.toLowerCase() === "redeemed"
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {selectedPoint.type?.toLowerCase() === "redeemed"
                      ? "-"
                      : "+"}
                    {Math.abs(selectedPoint.points ?? 0).toLocaleString()} pts
                  </p>
                </div>

                {/* Transaction information */}
                <div className="space-y-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">Type</span>

                    <span className="text-sm font-semibold text-gray-900">
                      {selectedPoint.type || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">Description</span>

                    <span className="text-sm font-semibold text-gray-900 text-right">
                      {selectedPoint.description || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">Date</span>

                    <span className="text-sm font-semibold text-gray-900">
                      {selectedPoint.createdAt
                        ? new Date(selectedPoint.createdAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Purchase information */}
                {selectedPoint.purchase && (
                  <div className="border-t border-gray-200 pt-5">
                    <h4 className="font-bold text-gray-900 mb-4">
                      Purchase details
                    </h4>

                    <div className="space-y-4">
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-gray-500">Product</span>

                        <span className="text-sm font-semibold text-gray-900 text-right">
                          {selectedPoint.purchase.productName ||
                            selectedPoint.purchase.product?.name ||
                            "—"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-gray-500">Quantity</span>

                        <span className="text-sm font-semibold text-gray-900">
                          {selectedPoint.purchase.quantity ?? "—"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-gray-500">
                          Price per unit
                        </span>

                        <span className="text-sm font-semibold text-gray-900">
                          ₦
                          {(
                            selectedPoint.purchase.pricePerUnit ?? 0
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-gray-500">
                          Total price
                        </span>

                        <span className="text-sm font-semibold text-gray-900">
                          ₦
                          {(
                            selectedPoint.purchase.totalPrice ?? 0
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-gray-500">Status</span>

                        <span className="text-sm font-semibold text-gray-900">
                          {selectedPoint.purchase.status || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-5">
                <button
                  type="button"
                  onClick={() => setSelectedPoint(null)}
                  className="btn bg-gray-800 text-white border-gray-800 hover:bg-gray-700 w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Redemption History */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Redemption history</h2>

            <p className="text-sm text-muted-foreground mt-1">
              Rewards you have redeemed.
            </p>
          </div>

          <div className="card bg-card border border-border shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-10">
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : redemptions.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No rewards redeemed yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {redemptions.map((redemption) => (
                  <div
                    key={redemption._id}
                    onClick={() => setSelectedRedemption(redemption)}
                    className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Icon icon="solar:gift-outline" className="size-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold">
                          {redemption.reward?.name ||
                            redemption.rewardName ||
                            "Reward redeemed"}
                        </p>

                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(
                            redemption.createdAt || redemption.created_at,
                          )}
                        </p>
                      </div>
                    </div>

                    <span className="font-bold text-red-500 shrink-0">
                      -
                      {(
                        redemption.pointsUsed ??
                        redemption.pointsRequired ??
                        0
                      ).toLocaleString()}{" "}
                      pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {selectedRedemption && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Redemption details
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Reward redemption information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRedemption(null)}
                  className="btn btn-sm btn-circle bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                  aria-label="Close redemption details"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Reward */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Icon icon="solar:gift-outline" className="size-6" />
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Reward</p>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {selectedRedemption.reward?.name ||
                          selectedRedemption.rewardName ||
                          "Reward"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Redemption information */}
                <div className="space-y-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">Points used</span>

                    <span className="text-sm font-bold text-red-500">
                      -
                      {(
                        selectedRedemption.pointsUsed ??
                        selectedRedemption.pointsRequired ??
                        0
                      ).toLocaleString()}{" "}
                      pts
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">Status</span>

                    <span className="text-sm font-semibold text-green-600">
                      {selectedRedemption.status || "Completed"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">Date</span>

                    <span className="text-sm font-semibold text-gray-900 text-right">
                      {selectedRedemption.createdAt
                        ? new Date(
                            selectedRedemption.createdAt,
                          ).toLocaleString()
                        : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-gray-500">Redemption ID</span>

                    <span className="text-xs font-mono font-semibold text-gray-700 text-right break-all">
                      {selectedRedemption._id || "—"}
                    </span>
                  </div>
                </div>

                {/* Reward description */}
                {selectedRedemption.reward?.description && (
                  <div className="border-t border-gray-200 pt-5">
                    <p className="text-sm text-gray-500">Reward description</p>

                    <p className="text-sm text-gray-900 mt-2 leading-relaxed">
                      {selectedRedemption.reward.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-5">
                <button
                  type="button"
                  onClick={() => setSelectedRedemption(null)}
                  className="btn bg-gray-800 text-white border-gray-800 hover:bg-gray-700 w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileNav />
    </main>
  );
}
