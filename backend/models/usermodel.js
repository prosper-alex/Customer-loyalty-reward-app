const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    passwordChangedAt: {
      type: Date,
    },

    passwordResetCode: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationCode: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    emailVerificationSentAt: {
      type: Date,
      select: false,
    },

    pointsBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    favoriteProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    totalPointsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    referralRewardReceived: {
      type: Boolean,
      default: false,
  },
  },
  {
    timestamps: true,
  },


);

userSchema.pre("save", async function () {
  if (!this.isNew || this.referralCode) {
    return;
  }

  let code;
  let existingUser;

  do {
    code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    existingUser = await mongoose.models.User.findOne({
      referralCode: code,
    });
  } while (existingUser);

  this.referralCode = code;
});

module.exports = mongoose.model("User", userSchema);
