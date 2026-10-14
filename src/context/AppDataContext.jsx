import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import apiClient from "../lib/apiClient";

const AppDataContext = createContext(undefined);

export function AppDataProvider({ children }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [featuredRewards, setFeaturedRewards] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get current user profile
  const refreshProfile = useCallback(async () => {
    if (!user) return;

    try {
      const result = await apiClient("/auth/getUser");
      setProfile(result.data.user);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }, [user]);

  // Get available products
  const refreshProducts = useCallback(async () => {
    try {
      const result = await apiClient("/products/getAllProducts");

      setProducts(result.data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  }, []);

  // Get available rewards
  const refreshRewards = useCallback(async () => {
    if (!user) return;

    try {
      const result = await apiClient("/rewards/getRewards");
      setRewards(result.data?.rewards || []);
    } catch (error) {
      console.error("Failed to load rewards:", error);
    }
  }, [user]);

  // Get featured rewards
  const refreshFeaturedRewards = useCallback(async () => {
    if (!user) return;

    try {
      const result = await apiClient("/rewards/featured");
      setFeaturedRewards(result.data?.rewards || []);
    } catch (error) {
      console.error("Failed to load featured rewards:", error);
    }
  }, [user]);

  // Get purchase history
  const refreshPurchases = useCallback(async () => {
    if (!user) return;

    try {
      const result = await apiClient("/purchases/getMyPurchaseHistory");
      setPurchases(result.data.purchases || []);
    } catch (error) {
      console.error("Failed to load purchases:", error);
    }
  }, [user]);

  // Get points history
  const refreshPointsHistory = useCallback(async () => {
    if (!user) return;

    try {
      const result = await apiClient("/points/getMyPointsHistory");
      setPointsHistory(result.data?.transactions || []);
    } catch (error) {
      console.error("Failed to load points history:", error);
    }
  }, [user]);

  // Get redemption history
  const refreshRedemptions = useCallback(async () => {
    if (!user) return;

    try {
      const result = await apiClient("/rewards/getMyRedemptionHistory");
      setRedemptions(result.data?.redemptions || []);
    } catch (error) {
      console.error("Failed to load redemption history:", error);
    }
  }, [user]);

  // Get user's favourite products
  const refreshFavorites = useCallback(async () => {
    if (!user) return;

    try {
      const result = await apiClient("/favorites");

      setFavorites(result.data?.favoriteProducts || []);
    } catch (error) {
      console.error("Failed to load favourites:", error);
    }
  }, [user]);

  // Get user's notifications
  const refreshNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const result = await apiClient("/notifications/getMyNotifications");

      setNotifications(result.data?.notifications || []);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [user]);

  // Load customer data when user logs in
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProducts([]);
      setRewards([]);
      setFeaturedRewards([]);
      setPurchases([]);
      setPointsHistory([]);
      setRedemptions([]);
      setFavorites([]);
      setNotifications([]);
      return;
    }

    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        refreshProfile(),
        refreshProducts(),
        refreshRewards(),
        refreshFeaturedRewards(),
        refreshPurchases(),
        refreshPointsHistory(),
        refreshRedemptions(),
        refreshFavorites(),
        refreshNotifications(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [
    user,
    refreshProfile,
    refreshProducts,
    refreshRewards,
    refreshFeaturedRewards,
    refreshPurchases,
    refreshPointsHistory,
    refreshRedemptions,
    refreshFavorites,
    refreshNotifications,
  ]);

  // Purchase a product
  const purchaseProduct = useCallback(
    async (productId, quantity) => {
      try {
        const result = await apiClient("/purchases/createPurchase", {
          method: "POST",
          body: JSON.stringify({
            productId,
            quantity,
          }),
        });

        // Refresh affected data after purchase
        await Promise.all([
          refreshProfile(),
          refreshProducts(),
          refreshPurchases(),
          refreshPointsHistory(),
          refreshNotifications(),
        ]);

        return {
          data: result.data,
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error,
        };
      }
    },
    [refreshProfile, refreshProducts, refreshPurchases, refreshPointsHistory],
  );

  // Redeem a reward
  const redeemReward = useCallback(
    async (rewardId) => {
      try {
        const result = await apiClient("/rewards/redeemReward", {
          method: "POST",
          body: JSON.stringify({
            rewardId,
          }),
        });

        // Refresh affected data after redemption
        await Promise.all([
          refreshProfile(),
          refreshRewards(),
          refreshFeaturedRewards(),
          refreshPointsHistory(),
          refreshRedemptions(),
          refreshNotifications(),
        ]);

        return {
          data: result.data,
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error,
        };
      }
    },
    [
      refreshProfile,
      refreshRewards,
      refreshFeaturedRewards,
      refreshPointsHistory,
      refreshRedemptions,
    ],
  );

  // Add product to favourites
  const addFavorite = useCallback(
    async (productId) => {
      try {
        const result = await apiClient(`/favorites/${productId}`, {
          method: "POST",
        });

        await refreshFavorites();

        return {
          data: result.data,
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error,
        };
      }
    },
    [refreshFavorites],
  );

  // Remove product from favourites
  const removeFavorite = useCallback(
    async (productId) => {
      try {
        const result = await apiClient(`/favorites/${productId}`, {
          method: "DELETE",
        });

        await refreshFavorites();

        return {
          data: result.data,
          error: null,
        };
      } catch (error) {
        return {
          data: null,
          error,
        };
      }
    },
    [refreshFavorites],
  );

  // Mark one notification as read
  const markNotificationRead = useCallback(async (notificationId) => {
    try {
      const result = await apiClient(
        `/notifications/markNotificationRead/${notificationId}`,
        {
          method: "PATCH",
        },
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );

      return {
        data: result.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error,
      };
    }
  }, []);

  // Mark all notifications as read
  const markAllNotificationsRead = useCallback(async () => {
    try {
      const result = await apiClient(
        "/notifications/markAllNotificationsRead",
        {
          method: "PATCH",
        },
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      );

      return {
        data: result.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error,
      };
    }
  }, []);

  const deleteReadNotifications = useCallback(async () => {
    try {
      const result = await apiClient("/notifications/deleteReadNotifications", {
        method: "DELETE",
      });

      setNotifications((currentNotifications) =>
        currentNotifications.filter((notification) => !notification.isRead),
      );

      return {
        data: result.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error,
      };
    }
  }, []);

  const isFavorite = useCallback(
    (productId) => {
      return favorites.some((product) => product._id === productId);
    },
    [favorites],
  );

  // Update profile
  const updateProfile = useCallback(async (fields) => {
    try {
      const result = await apiClient("/auth/updateUser", {
        method: "PATCH",
        body: JSON.stringify(fields),
      });

      setProfile(result.data.user);

      return {
        data: result.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error,
      };
    }
  }, []);

  const value = {
    profile,
    products,
    rewards,
    featuredRewards,
    purchases,
    pointsHistory,
    redemptions,
    favorites,

    loading,

    refreshProfile,
    refreshProducts,
    refreshRewards,
    refreshFeaturedRewards,
    refreshPurchases,
    refreshPointsHistory,
    refreshRedemptions,
    refreshFavorites,
    refreshNotifications,

    purchaseProduct,
    redeemReward,
    addFavorite,
    removeFavorite,
    isFavorite,
    updateProfile,

    // These are kept so existing components don't immediately break
    // while we replace the old Supabase-based settings screens.
    vouchers: [],
    paymentMethods: [],
    notificationPrefs: null,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteReadNotifications,

    useVoucher: async () => ({
      error: new Error("Vouchers are not part of this MVP"),
    }),

    updateNotificationPrefs: async () => ({
      error: new Error("Notification settings are not part of this MVP"),
    }),

    addPaymentMethod: async () => ({
      error: new Error("Payment methods are not part of this MVP"),
    }),

    removePaymentMethod: async () => ({
      error: new Error("Payment methods are not part of this MVP"),
    }),

    setDefaultPaymentMethod: async () => ({
      error: new Error("Payment methods are not part of this MVP"),
    }),

    submitSupportTicket: async () => ({
      error: new Error("Support tickets are not part of this MVP"),
    }),
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);

  if (ctx === undefined) {
    throw new Error("useAppData must be used inside <AppDataProvider>");
  }

  return ctx;
}
