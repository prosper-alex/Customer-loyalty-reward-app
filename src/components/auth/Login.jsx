import { useState } from "react";
import { Icon } from "@iconify/react";
// import { Link, useNavigate} from "react-router-dom";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // const [email, setEmail] = useState("");
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setSubmitting(true);
    const { error } = await signIn({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background px-5 overflow-hidden">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-sm mb-4">
            <Icon icon="solar:crown-star-bold" className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your LoyaltyApp account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              className="input input-bordered w-full mt-1.5 bg-input border-transparent focus:border-primary rounded-xl"
              placeholder="you@example.com"
            />
          </div>
          <div className="relative mt-1.5">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="input input-bordered w-full bg-input border-transparent focus:border-primary rounded-xl pr-12"
              placeholder="••••••••"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <Icon
                icon={
                  showPassword ? "solar:eye-linear" : "solar:eye-closed-linear"
                }
                className="size-5"
              />
            </button>
          </div>

          {error && (
            <p className="text-sm font-semibold text-primary bg-primary/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {successMessage && (
            <p
              role="status"
              className="text-sm font-semibold text-green-700 bg-green-100 rounded-xl px-4 py-3"
            >
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full rounded-xl h-12 font-bold disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/forgot-password")}
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </button>

        <p className="text-sm text-center text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
