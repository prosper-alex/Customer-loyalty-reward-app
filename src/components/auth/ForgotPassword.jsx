import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../lib/apiClient";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await apiClient("/auth/forgotPassword", {
        method: "POST",
        body: JSON.stringify({
          email,
        }),
      });

      setMessage(result.message);
      setStep(2);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await apiClient("/auth/resetPassword", {
        method: "POST",
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      setMessage(result.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-white border border-gray-200 shadow-lg">
        <div className="card-body">
          {step === 1 ? (
            <>
              <h2 className="card-title text-2xl mb-2">Forgot Password?</h2>

              <p className="text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a password reset
                code.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text text-gray-700">Email</span>
                  </label>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full bg-white text-gray-900 border-gray-300"
                    required
                  />
                </div>

                {message && (
                  <div className="alert alert-success text-sm">{message}</div>
                )}

                {error && (
                  <div className="alert alert-error text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="btn mt-3 bg-gray-800 text-white border-gray-800 hover:bg-gray-700"
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <h2 className="card-title text-2xl mb-2">Reset Password</h2>

              <p className="text-sm text-base-content/70 mb-4">
                Enter the 6-digit code sent to your email and choose a new
                password.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Reset Code</span>
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    placeholder="Enter 6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">New Password</span>
                  </label>

                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input input-bordered w-full"
                    minLength="6"
                    required
                  />
                </div>

                {message && (
                  <div className="alert alert-success text-sm">{message}</div>
                )}

                {error && (
                  <div className="alert alert-error text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn btn-ghost mt-3"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
