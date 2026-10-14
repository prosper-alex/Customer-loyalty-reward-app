import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  const [referralCode, setReferralCode] = useState(
    searchParams.get("ref")?.toUpperCase() || "",
  );

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    const { error } = await signUp({
      firstName,
      lastName,
      email,
      phone,
      password,
      referralCode,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Registration is successful, but the backend requires
    // email verification before the user can log in.
    // navigate("/verify-email", {
    //   replace: true,
    //   state: { email },
    // });

    // Registration successful; redirect to login.
    navigate("/login", {
      replace: true,
      state: {
        message: "Account created successfully. You can now log in.",
        email,
      },
    });
  };;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-4">
            <Icon icon="solar:crown-star-bold" className="size-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Create your account
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Join LoyaltyApp and start earning points
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="text-sm font-semibold" htmlFor="firstName">
              First name
            </label>

            <input
              id="firstName"
              type="text"
              name="firstName"
              autoComplete="given-name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              placeholder="Chidinma"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-semibold" htmlFor="lastName">
              Last name
            </label>

            <input
              id="lastName"
              type="text"
              name="lastName"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              placeholder="Okafor"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold" htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              placeholder="you@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-semibold" htmlFor="phone">
              Phone number
            </label>

            <input
              id="phone"
              type="tel"
              name="phone"
              autoComplete="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              placeholder="08012345678"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="text-sm font-semibold" htmlFor="password">
              Password
            </label>

            <div className="relative mt-1.5">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="input input-bordered w-full pr-12 bg-input border-transparent focus:border-primary rounded-xl"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <Icon
                  icon={
                    showPassword
                      ? "solar:eye-linear"
                      : "solar:eye-closed-linear"
                  }
                  className="size-5"
                />
              </button>
            </div>
          </div>

          {/* Referral Code */}
          <div>
            <label className="text-sm font-semibold" htmlFor="referralCode">
              Referral code{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>

            <input
              id="referralCode"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl uppercase tracking-wider"
              placeholder="Enter referral code"
              maxLength={6}
            />

            <p className="text-xs text-muted-foreground mt-1.5">
              Have a referral code? Enter it here.
            </p>
          </div>

          {error && (
            <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full rounded-xl h-12 font-bold disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
