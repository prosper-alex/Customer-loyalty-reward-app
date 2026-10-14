import { useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { SettingsHeader } from "./SettingsHeader";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export function PrivacySecurity() {
  const { updatePassword, signOut } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPwError("");
    setPwSaved(false);

    if (!currentPassword) {
      setPwError("Please enter your current password.");
      return;
    }

    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("Passwords don't match.");
      return;
    }

    setSaving(true);

    try {
      await updatePassword(newPassword, currentPassword);

      setPwSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/auth/deactivateAccount`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to deactivate account");
      }

      signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <SettingsHeader title="Privacy & Security" />

      <div className="px-5 md:px-8 mt-6 max-w-lg space-y-8">
        <form
          onSubmit={handleChangePassword}
          className="card bg-card border border-border shadow-sm"
        >
          <div className="card-body p-6 space-y-4">
            <h2 className="font-bold text-lg">Change password</h2>

            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="currentPassword"
              >
                Current password
              </label>

              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label className="text-sm font-semibold" htmlFor="newPassword">
                New password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label
                className="text-sm font-semibold"
                htmlFor="confirmPassword"
              >
                Confirm new password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
                placeholder="Confirm your new password"
              />
            </div>

            {pwError && (
              <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">
                {pwError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary w-full rounded-xl h-12 font-bold disabled:opacity-60"
            >
              {saving ? (
                "Updating…"
              ) : pwSaved ? (
                <span className="flex items-center gap-2">
                  <Icon icon="solar:check-circle-bold" className="size-5" />
                  Password updated
                </span>
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </form>

        <div className="card bg-card border border-border shadow-sm">
          <div className="card-body p-6 space-y-3">
            <h2 className="font-bold text-lg">Data & privacy</h2>

            <p className="text-sm text-muted-foreground">
              Your account information, points balance, purchase history, and
              redemption history are protected by authenticated access.
            </p>
          </div>
        </div>

        <div className="card bg-primary/5 border border-primary/20 shadow-sm">
          <div className="card-body p-6 space-y-3">
            <h2 className="font-bold text-lg text-primary">
              Deactivate account
            </h2>

            <p className="text-sm text-muted-foreground">
              Deactivating your account prevents you from logging in until an
              administrator activates it again.
            </p>

            {deleteError && (
              <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">
                {deleteError}
              </p>
            )}

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn btn-outline btn-primary w-full rounded-xl h-12 font-bold"
              >
                Deactivate my account
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="btn btn-ghost flex-1 rounded-xl h-12 font-bold"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="btn btn-primary flex-1 rounded-xl h-12 font-bold disabled:opacity-60"
                >
                  {deleting ? "Deactivating…" : "Yes, deactivate"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
