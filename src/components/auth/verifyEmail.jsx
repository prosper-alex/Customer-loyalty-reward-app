import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../lib/apiClient";

export function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Verification code must be 6 digits.");
      return;
    }

    setSubmitting(true);

    try {
      await apiClient("/auth/verifyEmail", {
        method: "POST",
        body: JSON.stringify({
          email,
          code,
        }),
      });

      setSuccess("Email verified successfully. You can now sign in.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { email },
        });
      }, 1200);
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setResending(true);

    try {
      const result = await apiClient("/auth/resendVerificationCode", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });

      setSuccess(
        result.message ||
          "A new verification code has been sent to your email.",
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-4">
            <Icon icon="solar:letter-unread-bold" className="size-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Verify your email
          </h1>

          <p className="text-sm text-muted-foreground mt-2 text-center">
            Enter the 6-digit verification code sent to your email address.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-semibold" htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              placeholder="you@example.com"
            />
          </div>

          {/* Verification Code */}
          <div>
            <label className="text-sm font-semibold" htmlFor="code">
              Verification code
            </label>

            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl text-center tracking-[0.4em] text-lg font-bold"
              placeholder="123456"
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm font-semibold text-success bg-success/10 rounded-xl px-4 py-3">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full rounded-xl h-12 font-bold disabled:opacity-60"
          >
            {submitting ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="btn btn-ghost w-full rounded-xl mt-3 font-bold"
        >
          {resending ? "Sending…" : "Resend verification code"}
        </button>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already verified?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
