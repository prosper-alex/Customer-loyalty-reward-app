const mongoose = require("mongoose");

const Reward = require("../models/rewardModel");
const Redemption = require("../models/redemptionModel");
const User = require("../models/usermodel");
const Point = require("../models/pointModel");
const Notification = require("../models/notificationModel");

const isValidId = (id) => mongoose.isValidObjectId(id);

// Send notifications without making the main operation appear to fail.
const createNotificationSafely = async (notificationData) => {
try {
await Notification.create(notificationData);
} catch (error) {
console.error("Notification creation failed:", error.message);
}
};

// CREATE REWARD - ADMIN
exports.createReward = async (req, res) => {
try {
const {
name,
description,
pointsRequired,
quantity,
featured = false,
} = req.body;


const normalizedName =
  typeof name === "string" ? name.trim() : "";

const normalizedDescription =
  typeof description === "string" ? description.trim() : "";

if (
  !normalizedName ||
  !normalizedDescription ||
  pointsRequired === undefined ||
  quantity === undefined
) {
  return res.status(400).json({
    success: false,
    message: "Name, description, points required, and quantity are required",
    data: null,
  });
}

if (!Number.isInteger(pointsRequired) || pointsRequired < 1) {
  return res.status(400).json({
    success: false,
    message: "Points required must be a whole number greater than 0",
    data: null,
  });
}

if (!Number.isInteger(quantity) || quantity < 0) {
  return res.status(400).json({
    success: false,
    message: "Quantity must be a non-negative whole number",
    data: null,
  });
}

if (typeof featured !== "boolean") {
  return res.status(400).json({
    success: false,
    message: "Featured must be true or false",
    data: null,
  });
}

if (featured && quantity === 0) {
  return res.status(400).json({
    success: false,
    message: "A reward with no stock cannot be featured",
    data: null,
  });
}

const existingReward = await Reward.findOne({
  name: normalizedName,
});

if (existingReward) {
  return res.status(409).json({
    success: false,
    message: "A reward with this name already exists",
    data: null,
  });
}

const reward = await Reward.create({
  name: normalizedName,
  description: normalizedDescription,
  pointsRequired,
  quantity,
  isAvailable: quantity > 0,
  featured: featured && quantity > 0,
});

// Notify active users. Notification failure does not undo reward creation.
try {
  const activeUsers = await User.find({
    isActive: true,
  }).select("_id");

  if (activeUsers.length > 0) {
    await Notification.insertMany(
      activeUsers.map((user) => ({
        user: user._id,
        title: "New reward available!",
        body: `${reward.name} is now available to redeem.`,
      })),
      { ordered: false }
    );
  }
} catch (notificationError) {
  console.error(
    "Reward created, but notifications could not all be sent:",
    notificationError.message
  );
}

return res.status(201).json({
  success: true,
  message: "Reward created successfully",
  data: { reward },
});


} catch (error) {
console.error("Error creating reward:", error);

if (error.code === 11000) {
  return res.status(409).json({
    success: false,
    message: "A reward with this name already exists",
    data: null,
  });
}

if (error.name === "ValidationError" || error.name === "CastError") {
  return res.status(400).json({
    success: false,
    message: "Invalid reward details",
    data: null,
  });
}

return res.status(500).json({
  success: false,
  message: "Unable to create reward",
  data: null,
});


}
};

// GET AVAILABLE REWARDS - USER
exports.getRewards = async (req, res) => {
try {
const rewards = await Reward.find({
isAvailable: true,
quantity: { $gt: 0 },
}).sort({ pointsRequired: 1 });


return res.status(200).json({
  success: true,
  message: "Available rewards retrieved successfully",
  data: { rewards },
});


} catch (error) {
console.error("Error getting available rewards:", error);

return res.status(500).json({
  success: false,
  message: "Unable to retrieve available rewards",
  data: null,
});

}
};

// GET ALL REWARDS - ADMIN
exports.getAllRewards = async (req, res) => {
try {
const rewards = await Reward.find().sort({ createdAt: -1 });


return res.status(200).json({
  success: true,
  message: "All rewards retrieved successfully",
  data: { rewards },
});


} catch (error) {
console.error("Error getting all rewards:", error);

return res.status(500).json({
  success: false,
  message: "Unable to retrieve rewards",
  data: null,
});


}
};

// REDEEM REWARD - USER
exports.redeemReward = async (req, res) => {
const { rewardId } = req.body;

if (!rewardId) {
return res.status(400).json({
success: false,
message: "Reward ID is required",
data: null,
});
}

if (!isValidId(rewardId)) {
return res.status(400).json({
success: false,
message: "Invalid reward ID",
data: null,
});
}

const session = await mongoose.startSession();
let responseData;

try {
await session.withTransaction(async () => {
const reward = await Reward.findById(rewardId).session(session);


  if (!reward) {
    const error = new Error("REWARD_NOT_FOUND");
    throw error;
  }

  if (!reward.isAvailable || reward.quantity <= 0) {
    const error = new Error("REWARD_UNAVAILABLE");
    throw error;
  }

  const user = await User.findById(req.user._id).session(session);

  if (!user) {
    const error = new Error("USER_NOT_FOUND");
    throw error;
  }

  // Reserve one unit only if the reward remains available and in stock.
  const reservedReward = await Reward.findOneAndUpdate(
    {
      _id: reward._id,
      isAvailable: true,
      quantity: { $gt: 0 },
    },
    {
      $inc: { quantity: -1 },
    },
    {
      new: true,
      session,
      runValidators: true,
    }
  );

  if (!reservedReward) {
    const error = new Error("REWARD_UNAVAILABLE");
    throw error;
  }

  // Deduct points only if the current balance is sufficient.
  const updatedUser = await User.findOneAndUpdate(
    {
      _id: user._id,
      pointsBalance: { $gte: reward.pointsRequired },
    },
    {
      $inc: {
        pointsBalance: -reward.pointsRequired,
      },
    },
    {
      new: true,
      session,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    const error = new Error("INSUFFICIENT_POINTS");
    throw error;
  }

  // A reward with no remaining stock becomes unavailable and unfeatured.
  if (reservedReward.quantity === 0) {
    reservedReward.isAvailable = false;
    reservedReward.featured = false;
    await reservedReward.save({ session });
  }

  const redemption = new Redemption({
    user: updatedUser._id,
    reward: reservedReward._id,
    pointsUsed: reward.pointsRequired,
    status: "Completed",
  });

  const pointTransaction = new Point({
    user: updatedUser._id,
    type: "Redeemed",
    points: reward.pointsRequired,
    description: `Points redeemed for ${reward.name}`,
  });

  await redemption.save({ session });
  await pointTransaction.save({ session });

  responseData = {
    redemption: redemption.toObject(),
    pointTransaction: pointTransaction.toObject(),
    reward: reward.name,
    pointsUsed: reward.pointsRequired,
    remainingPoints: updatedUser.pointsBalance,
    remainingRewardQuantity: reservedReward.quantity,
  };
});

await createNotificationSafely({
  user: req.user._id,
  title: "Reward redeemed!",
  body: `You redeemed ${responseData.pointsUsed} points for ${responseData.reward}. Your remaining balance is ${responseData.remainingPoints} points.`,
});

return res.status(201).json({
  success: true,
  message: "Reward redeemed successfully",
  data: responseData,
});

} catch (error) {
console.error("Error redeeming reward:", error);

const knownErrors = {
  REWARD_NOT_FOUND: {
    status: 404,
    message: "Reward not found",
  },
  USER_NOT_FOUND: {
    status: 404,
    message: "User not found",
  },
  REWARD_UNAVAILABLE: {
    status: 400,
    message: "This reward is currently unavailable",
  },
  INSUFFICIENT_POINTS: {
    status: 400,
    message: "You do not have enough points to redeem this reward",
  },
};

const knownError = knownErrors[error.message];

if (knownError) {
  return res.status(knownError.status).json({
    success: false,
    message: knownError.message,
    data: null,
  });
}

// Concurrent transaction conflicts can occur under simultaneous requests.
if (
  error.code === 112 ||
  error.codeName === "WriteConflict" ||
  error.hasErrorLabel?.("TransientTransactionError")
) {
  return res.status(409).json({
    success: false,
    message: "This redemption conflicted with another request. Please try again.",
    data: null,
  });
}

if (error.name === "ValidationError" || error.name === "CastError") {
  return res.status(400).json({
    success: false,
    message: "Invalid redemption details",
    data: null,
  });
}

return res.status(500).json({
  success: false,
  message: "Unable to redeem reward",
  data: null,
});


} finally {
await session.endSession();
}
};

// GET MY REDEMPTION HISTORY - USER
exports.getMyRedemptionHistory = async (req, res) => {
try {
const redemptions = await Redemption.find({
user: req.user._id,
})
.populate("reward", "name description pointsRequired")
.sort({ createdAt: -1 });

return res.status(200).json({
  success: true,
  message: "Your redemption history retrieved successfully",
  data: { redemptions },
});

} catch (error) {
console.error("Error getting redemption history:", error);

return res.status(500).json({
  success: false,
  message: "Unable to retrieve redemption history",
  data: null,
});

}
};

// GET ALL REDEMPTION HISTORY - ADMIN
exports.getAllRedemptionHistory = async (req, res) => {
try {
const redemptions = await Redemption.find()
.populate("user", "firstName lastName email")
.populate("reward", "name description pointsRequired")
.sort({ createdAt: -1 });

return res.status(200).json({
  success: true,
  message: "All redemption history retrieved successfully",
  data: { redemptions },
});

} catch (error) {
console.error("Error getting all redemption history:", error);

return res.status(500).json({
  success: false,
  message: "Unable to retrieve redemption history",
  data: null,
});

}
};

// DEACTIVATE REWARD - ADMIN
exports.deactivateReward = async (req, res) => {
const { id } = req.params;

if (!isValidId(id)) {
return res.status(400).json({
success: false,
message: "Invalid reward ID",
data: null,
});
}

try {
const reward = await Reward.findById(id);

if (!reward) {
  return res.status(404).json({
    success: false,
    message: "Reward not found",
    data: null,
  });
}

reward.isAvailable = false;
reward.featured = false;

await reward.save();

  return res.status(200).json({
    success: true,
    message: "Reward deactivated successfully",
    data: reward,
  });
  
} catch (error) {
console.error("Error deactivating reward:", error);


return res.status(500).json({
  success: false,
  message: "Unable to deactivate reward",
  data: null,
});

}
};

// REACTIVATE REWARD - ADMIN
exports.reactivateReward = async (req, res) => {
const { id } = req.params;

if (!isValidId(id)) {
return res.status(400).json({
success: false,
message: "Invalid reward ID",
data: null,
});
}

try {
const reward = await Reward.findById(id);

if (!reward) {
  return res.status(404).json({
    success: false,
    message: "Reward not found",
    data: null,
  });
}

if (reward.quantity <= 0) {
  return res.status(400).json({
    success: false,
    message: "Reward cannot be reactivated because it has no stock",
    data: null,
  });
}

reward.isAvailable = true;

await reward.save();

return res.status(200).json({
  success: true,
  message: "Reward reactivated successfully",
  data: reward,
});

} catch (error) {
console.error("Error reactivating reward:", error);

return res.status(500).json({
  success: false,
  message: "Unable to reactivate reward",
  data: null,
});

}
};

// TOGGLE FEATURED REWARD - ADMIN
exports.toggleFeaturedReward = async (req, res) => {
const { id } = req.params;

if (!isValidId(id)) {
return res.status(400).json({
success: false,
message: "Invalid reward ID",
data: null,
});
}

try {
const reward = await Reward.findById(id);

if (!reward) {
  return res.status(404).json({
    success: false,
    message: "Reward not found",
    data: null,
  });
}

if (
  !reward.featured &&
  (!reward.isAvailable || reward.quantity <= 0)
) {
  return res.status(400).json({
    success: false,
    message: "Only available rewards with stock can be featured",
    data: null,
  });
}

reward.featured = !reward.featured;

await reward.save();

return res.status(200).json({
  success: true,
  message: reward.featured
    ? "Reward featured successfully"
    : "Reward removed from featured rewards",
  data: { reward },
});


} catch (error) {
console.error("Error toggling featured reward:", error);

return res.status(500).json({
  success: false,
  message: "Unable to update featured reward",
  data: null,
});

}
};

// GET FEATURED REWARDS - USER
exports.getFeaturedRewards = async (req, res) => {
try {
const rewards = await Reward.find({
featured: true,
isAvailable: true,
quantity: { $gt: 0 },
}).sort({ createdAt: -1 });


return res.status(200).json({
  success: true,
  message: "Featured rewards retrieved successfully",
  data: { rewards },
});

} catch (error) {
console.error("Error getting featured rewards:", error);

return res.status(500).json({
  success: false,
  message: "Unable to retrieve featured rewards",
  data: null,
});

}
};
