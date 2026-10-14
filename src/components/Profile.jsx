import apiClient from "../lib/apiClient";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileNav } from "./Sidebar";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export function Profile() {
  const navigate = useNavigate();
  const { profile, redemptions, updateProfile } = useAppData();
  const { signOut } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleProfilePhotoUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    const fileName = file.name.toLowerCase();

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".avif",
      ".heic",
      ".heif",
    ];

    const hasAllowedExtension = allowedExtensions.some((extension) =>
      fileName.endsWith(extension),
    );

    const hasImageMimeType = file.type.startsWith("image/");

    if (!hasImageMimeType && !hasAllowedExtension) {
      setError("Please select a supported image file.");
      event.target.value = "";
      return;
    }

    // Allow images up to 10 MB.
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setUploadingPhoto(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const uploadData = new FormData();
      uploadData.append("profilePhoto", file);

      await apiClient("/auth/uploadProfilePhoto", {
        method: "PATCH",
        body: uploadData,
      });

      setMessage("Profile photo updated successfully.");

      // Refresh the profile data displayed by the application.
      window.location.reload();
    } catch (uploadError) {
      setError(uploadError.message || "Failed to upload profile photo.");
    } finally {
      setUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setSaving(true);

    const { error: updateError } = await updateProfile({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phone: formData.phone.trim(),
    });

    setSaving(false);

    if (updateError) {
      setError(updateError.message || "Failed to update profile.");
      return;
    }

    setMessage("Profile updated successfully.");
  };

  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    : "—";

  const points = profile?.pointsBalance ?? 0;

  return (
    <main className="w-full text-foreground pb-24 md:pb-8 min-h-screen">
      <header className="px-5 md:px-8 pt-6 pb-6 border-b border-border/40">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Profile
        </h1>

        <p className="text-muted-foreground mt-2">
          Manage your account information.
        </p>
      </header>

      <div className="px-5 md:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Card */}
          <section className="card bg-card border border-border shadow-sm">
            <div className="card-body p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                {/* Profile Photo */}
                <div className="size-24 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={`${profile?.firstName || "User"} profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold">
                      {profile?.firstName?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                {/* Profile Information */}
                <div>
                  <h2 className="text-2xl font-bold">{fullName}</h2>

                  <p className="text-muted-foreground mt-1">
                    {profile?.email || "—"}
                  </p>

                  {/* Change Profile Photo */}
                  <label className="btn btn-dark btn-sm cursor-pointer mt-3 text-white">
                    <Icon icon="solar:camera-outline" className="size-4" />

                    {uploadingPhoto ? "Uploading..." : "Change Photo"}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                  </label>

                  {/* Account Badges */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="badge badge-lg bg-primary/10 text-primary border-none font-semibold">
                      {profile?.role || "USER"}
                    </span>

                    {profile?.isEmailVerified && (
                      <span className="badge badge-lg bg-green-500/10 text-green-600 border-none font-semibold">
                        Email Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Account Overview */}
          <section>
            <h2 className="text-xl font-bold mb-4">Account Overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Current Points */}
              <div className="card bg-card border border-border shadow-sm">
                <div className="card-body p-6">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon icon="solar:star-outline" className="size-5" />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Current Points
                  </p>

                  <p className="text-3xl font-bold mt-1">
                    {points.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Rewards Redeemed */}
              <div className="card bg-card border border-border shadow-sm">
                <div className="card-body p-6">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon icon="solar:gift-outline" className="size-5" />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Rewards Redeemed
                  </p>

                  <p className="text-3xl font-bold mt-1">
                    {redemptions.length}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="card bg-card border border-border shadow-sm">
                <div className="card-body p-6">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon icon="solar:phone-outline" className="size-5" />
                  </div>

                  <p className="text-sm text-muted-foreground">Phone</p>

                  <p className="text-lg font-bold mt-2 break-words">
                    {profile?.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Referral */}
          <section className="card bg-card border border-border shadow-sm">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon
                    icon="solar:users-group-rounded-outline"
                    className="size-5"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold">Refer a Friend</h2>

                  <p className="text-sm text-muted-foreground">
                    Share your referral code with friends.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Your Referral Code
                    </span>
                  </label>

                  <input
                    type="text"
                    value={profile?.referralCode || ""}
                    readOnly
                    className="input input-bordered w-full bg-gray-100 text-gray-900 border-gray-300 font-bold tracking-wider"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        profile?.referralCode || "",
                      );
                      setMessage("Referral code copied successfully.");
                    }}
                    className="btn btn-dark text-white w-full sm:w-auto"
                    disabled={!profile?.referralCode}
                  >
                    <Icon icon="solar:copy-outline" className="size-5" />
                    Copy Code
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Edit Personal Information */}
          <section className="card bg-card border border-border shadow-sm">
            <div className="card-body p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon icon="solar:user-id-outline" className="size-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold">Personal Information</h2>

                  <p className="text-sm text-muted-foreground">
                    Update your account details
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        First Name
                      </span>
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="input input-bordered w-full bg-gray-100 text-gray-900 border-gray-300"
                      placeholder="First name"
                      disabled={saving}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold">
                        Last Name
                      </span>
                    </label>

                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="input input-bordered w-full bg-gray-100 text-gray-900 border-gray-300"
                      placeholder="Last name"
                      disabled={saving}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Email</span>
                  </label>

                  <input
                    type="email"
                    value={profile?.email || ""}
                    className="input input-bordered w-full bg-gray-100 text-gray-900 border-gray-300"
                    disabled
                  />

                  <p className="text-xs text-muted-foreground mt-2">
                    Email cannot be changed from your profile.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Phone Number
                    </span>
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input input-bordered w-full bg-gray-100 text-gray-900 border-gray-300"
                    placeholder="Phone number"
                    disabled={saving}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="alert alert-error">
                    <Icon
                      icon="solar:danger-circle-outline"
                      className="size-5"
                    />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}
                {message && (
                  <div className="alert alert-success">
                    <Icon
                      icon="solar:check-circle-outline"
                      className="size-5"
                    />
                    <span>{message}</span>
                  </div>
                )}

                {/* Save Changes */}
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? (
                    <>
                      <span className="loading loading-spinner loading-sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icon icon="solar:diskette-outline" className="size-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Security */}
          <section className="card bg-card border border-border shadow-sm">
            <div className="card-body p-6">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon icon="solar:shield-check-outline" className="size-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold">Security</h2>

                  <p className="text-sm text-muted-foreground">
                    Manage your account security
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/profile/privacy-security")}
                className="btn btn-dark btn-sm cursor-pointer mt-3 text-white"
              >
                <Icon icon="solar:lock-keyhole-outline" className="size-5" />
                Privacy & Security
              </button>
            </div>
          </section>

          {/* Log Out */}
          <section>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn btn-error btn-outline w-full sm:w-auto px-10 rounded-xl font-bold"
            >
              <Icon icon="solar:logout-2-outline" className="size-5" />
              Log Out
            </button>
          </section>
        </div>
      </div>

      <MobileNav />
    </main>
  );
}
