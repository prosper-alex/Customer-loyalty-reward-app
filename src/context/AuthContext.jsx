import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get the currently logged-in user when the app starts
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/auth/getUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to get user");
        }

        return result;
      })
      .then((result) => {
        setUser(result.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Register
  const signUp = async ({
    firstName,
    lastName,
    email,
    phone,
    password,
    referralCode,
  }) => {
    try {
      const response = await fetch(`${API_URL}/auth/createUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          referralCode,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: result.message || "Registration failed",
          },
        };
      }

      return {
        data: result.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: {
          message: "Unable to connect to the server",
        },
      };
    }
  };

  // Login
  const signIn = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_URL}/auth/loginUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: result.message || "Login failed",
          },
        };
      }

      const token = result.data?.token;

      if (!token) {
        return {
          data: null,
          error: {
            message: "Login succeeded but no token was returned",
          },
        };
      }

      localStorage.setItem("token", token);

      // Get the logged-in user's profile
      const userResponse = await fetch(`${API_URL}/auth/getUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userResult = await userResponse.json();

      if (!userResponse.ok) {
        localStorage.removeItem("token");

        return {
          data: null,
          error: {
            message: userResult.message || "Unable to load user profile",
          },
        };
      }

      setUser(userResult.data.user);

      return {
        data: {
          user: userResult.data.user,
          token,
        },
        error: null,
      };
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);

      return {
        data: null,
        error: {
          message: "Unable to connect to the server",
        },
      };
    }
  };

  // Logout
  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // Change password
  const updatePassword = async (newPassword, currentPassword) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("You are not logged in");
    }

    const response = await fetch(`${API_URL}/auth/changePassword`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to change password");
    }

    return result;
  };

  const value = {
    user,
    loading,
    session: user ? { user } : null,
    signUp,
    signIn,
    signOut,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}