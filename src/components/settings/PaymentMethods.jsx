import { useState } from "react";
import { Icon } from "@iconify/react";
import { SettingsHeader } from "./SettingsHeader";
import { useAppData } from "../../context/AppDataContext";

const BRANDS = ["Verve", "Mastercard", "Visa"];

export function PaymentMethods() {
  const { paymentMethods, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [brand, setBrand] = useState(BRANDS[0]);
  const [last4, setLast4] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setBrand(BRANDS[0]);
    setLast4("");
    setExpMonth("");
    setExpYear("");
    setError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{4}$/.test(last4)) {
      setError("Enter the last 4 digits of the card.");
      return;
    }
    const m = Number(expMonth);
    const y = Number(expYear);
    if (!m || m < 1 || m > 12 || !y || y < new Date().getFullYear()) {
      setError("Enter a valid expiry month and year.");
      return;
    }
    setSubmitting(true);
    const { error } = await addPaymentMethod({
      brand,
      last4,
      exp_month: m,
      exp_year: y,
      is_default: paymentMethods.length === 0,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    resetForm();
    setShowForm(false);
  };

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <SettingsHeader title="Payment Methods" />

      <div className="px-5 md:px-8 mt-6 max-w-lg space-y-4">
        <p className="text-sm text-muted-foreground">
          Card details are used for account records only — we never store your full card number.
        </p>

        {paymentMethods.length === 0 && !showForm && (
          <div className="card bg-card border border-border shadow-sm">
            <div className="card-body p-8 items-center text-center">
              <Icon icon="solar:card-outline" className="size-10 text-muted-foreground mb-2" />
              <p className="font-bold">No payment methods yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add a card to speed up checkout in-store.</p>
            </div>
          </div>
        )}

        {paymentMethods.map((pm) => (
          <div key={pm.id} className="card bg-card border border-border shadow-sm">
            <div className="card-body p-5 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon icon="solar:card-bold" className="size-6" />
                </div>
                <div>
                  <p className="font-bold">
                    {pm.brand} •••• {pm.last4}
                    {pm.is_default && (
                      <span className="ml-2 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md align-middle">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {String(pm.exp_month).padStart(2, "0")}/{pm.exp_year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!pm.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefaultPaymentMethod(pm.id)}
                    className="btn btn-ghost btn-sm font-semibold text-primary"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Remove card"
                  onClick={() => removePaymentMethod(pm.id)}
                  className="btn btn-circle btn-ghost btn-sm text-muted-foreground hover:text-primary"
                >
                  <Icon icon="solar:trash-bin-trash-outline" className="size-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {showForm ? (
          <form onSubmit={handleAdd} className="card bg-card border border-border shadow-sm">
            <div className="card-body p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold">Card network</label>
                <select
                  className="select select-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold">Last 4 digits</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={last4}
                  onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
                  className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                  placeholder="1234"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold">Exp. month</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={expMonth}
                    onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, ""))}
                    className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                    placeholder="MM"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-semibold">Exp. year</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={expYear}
                    onChange={(e) => setExpYear(e.target.value.replace(/\D/g, ""))}
                    className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                    placeholder="YYYY"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="btn btn-ghost flex-1 rounded-xl h-12 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary flex-1 rounded-xl h-12 font-bold disabled:opacity-60"
                >
                  {submitting ? "Saving…" : "Save card"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn btn-outline btn-primary w-full rounded-xl h-12 font-bold"
          >
            <Icon icon="solar:add-circle-outline" className="size-5" />
            Add payment method
          </button>
        )}
      </div>
    </main>
  );
}
