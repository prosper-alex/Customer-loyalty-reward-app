const bcrypt = require("bcryptjs");

const User = require("../models/usermodel");

const Notification = require("../models/notificationModel");

const generateToken = require("../utilities/generateToken");

const sharp = require("sharp");

const convert = require("heic-convert");

const cloudinary = require("../config/cloudinary");

const streamifier = require("streamifier");

const generateVerificationCode = require("../utilities/generateEmailCode");

const sendVerificationEmail = require("../utilities/sendEmail");

const path = require("path");

const uploadImageToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "customer-loyalty/profile-photos",
        resource_type: "image",
        format: "jpg",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, referralCode } =
      req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
        data: null,
      });
    }

    // Check for existing user (email and phone)

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists",
          data: null,
        });
      }

      return res.status(409).json({
        success: false,
        message: "This phone number is already in use",
        data: null,
      });
    }

    let referredBy = null;

    if (referralCode) {
      const referrer = await User.findOne({
        referralCode: referralCode.trim().toUpperCase(),
      });

      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code",
          data: null,
        });
      }

      referredBy = referrer._id;
    }

    // Hashing password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Generate verification code

    // const verificationCode = generateVerificationCode();
    // const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    // const verificationSentAt = new Date();

    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: "USER",
      isActive: true,
      isEmailVerified: false,
      // emailVerificationCode: verificationCode,
      // emailVerificationExpires: verificationExpires,
      // emailVerificationSentAt: verificationSentAt,
      referredBy,
    });

    // try {
    //   await sendVerificationEmail(user.email, user.firstName, verificationCode);
    // } catch (error) {
    //   await User.findByIdAndDelete(user._id);

    //   return res.status(500).json({
    //     success: false,
    //     message:
    //       "Account could not be created because verification email failed",
    //     error: "Unable to send verification email",
    //     data: null,
    //   });
    // }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        pointsBalance: user.pointsBalance,
      },
    });
  } catch (error) {
    // console.error("Verification email failed:", error);

    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
      data: null,
    });
  }
};

// // VERIFY EMAIL
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { email, code } = req.body;

//     if (!email || !code) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and verification code are required",
//         data: null,
//       });
//     }

//     const normalizedEmail = email.toLowerCase().trim();

//     const user = await User.findOne({ email: normalizedEmail }).select(
//       "+emailVerificationCode +emailVerificationExpires",
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//         data: null,
//       });
//     }

//     if (user.isEmailVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is already verified",
//         data: null,
//       });
//     }

//     if (
//       !user.emailVerificationExpires ||
//       user.emailVerificationExpires < new Date()
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Verification code has expired",
//         data: null,
//       });
//     }

//     if (user.emailVerificationCode !== code) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid verification code",
//         data: null,
//       });
//     }

//     user.isEmailVerified = true;
//     user.isActive = true;

//     user.emailVerificationCode = undefined;
//     user.emailVerificationExpires = undefined;
//     user.emailVerificationSentAt = undefined;

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Email verified successfully. Your account is now active.",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to verify email",
//     });
//   }
// };

// // RESEND VERIFICATION CODE
// exports.resendVerificationCode = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//         data: null,
//       });
//     }

//     const normalizedEmail = email.toLowerCase().trim();

//     const user = await User.findOne({ email: normalizedEmail }).select(
//       "+emailVerificationCode +emailVerificationExpires +emailVerificationSentAt",
//     );

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//         data: null,
//       });
//     }

//     if (user.isEmailVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is already verified",
//         data: null,
//       });
//     }

//     if (user.emailVerificationSentAt) {
//       const secondsSinceLastSent =
//         (Date.now() - user.emailVerificationSentAt.getTime()) / 1000;

//       if (secondsSinceLastSent < 60) {
//         const secondsRemaining = Math.ceil(60 - secondsSinceLastSent);

//         return res.status(429).json({
//           success: false,
//           message: `Please wait ${secondsRemaining} seconds before requesting another verification code`,
//           data: null,
//         });
//       }
//     }

//     const verificationCode = generateVerificationCode();

//     const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

//     const verificationSentAt = new Date();

//     user.emailVerificationCode = verificationCode;
//     user.emailVerificationExpires = verificationExpires;
//     user.emailVerificationSentAt = verificationSentAt;

//     await user.save();

//     await sendVerificationEmail(user.email, user.firstName, verificationCode);

//     res.status(200).json({
//       success: true,
//       message: "A new verification code has been sent to your email.",
//       data: null,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Unable to resend verification code",
//       data: null,
//     });
//   }
// };

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    // Check required fields
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
        data: null,
      });
    }

    // Check if user exists and password match

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: null,
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
        data: null,
      });
    }

    // if (!user.isEmailVerified) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Please verify your email before logging in",
    //     data: null,
    //   });
    // }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
        data: null,
      });
    }

    const token = generateToken(user._id);

    await Notification.create({
      user: user._id,
      title: "Welcome back!",
      body: "You successfully signed in to your account.",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          pointsBalance: user.pointsBalance,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to login user",
      data: null,
    });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        data: null,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+passwordResetCode +passwordResetExpires",
    );

    // Use a generic response so people cannot discover
    // whether an email has an account.
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset code has been sent.",
        data: null,
      });
    }

    const resetCode = generateVerificationCode();

    const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.passwordResetCode = resetCode;
    user.passwordResetExpires = resetExpires;

    await user.save();

    try {
      await sendVerificationEmail(user.email, user.firstName, resetCode);
    } catch (error) {
      // Clear the reset code if email delivery fails
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      return res.status(500).json({
        success: false,
        message: "Unable to send password reset code",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset code has been sent.",
      data: null,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
      data: null,
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset code and new password are required",
        data: null,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
        data: null,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password +passwordResetCode +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
        data: null,
      });
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
        data: null,
      });
    }

    if (user.passwordResetCode !== code) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code",
        data: null,
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();

    // Invalidate the reset code after successful use
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
      data: null,
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
      data: null,
    });
  }
};

// get user

exports.getUser = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    data: {
      user: {
        id: req.user._id.toString(),
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        pointsBalance: req.user.pointsBalance,
        totalPointsEarned: req.user.totalPointsEarned,
        isEmailVerified: req.user.isEmailVerified,
        profilePhoto: req.user.profilePhoto,
        referralCode: req.user.referralCode,
      },
    },
  });
};

// Get all users (ADMIN)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select(
      "-password -emailVerificationExpires -emailVerificationSentAt",
    );

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve users",
      data: null,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = req.user;

    
if (
  firstName === undefined &&
  lastName === undefined &&
  phone === undefined
) {
  return res.status(400).json({
    success: false,
    message: "Provide at least one field to update",
    data: null,
  });
}

if (firstName !== undefined) {
  if (typeof firstName !== "string" || !firstName.trim()) {
    return res.status(400).json({
      success: false,
      message: "First name must be a non-empty string",
      data: null,
    });
  }

  user.firstName = firstName.trim();
}

if (lastName !== undefined) {
  if (typeof lastName !== "string" || !lastName.trim()) {
    return res.status(400).json({
      success: false,
      message: "Last name must be a non-empty string",
      data: null,
    });
  }

  user.lastName = lastName.trim();
}

if (phone !== undefined) {
  if (typeof phone !== "string" || !phone.trim()) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be a non-empty string",
      data: null,
    });
  }

  const normalizedPhone = phone.trim();

  const existingPhone = await User.findOne({
    phone: normalizedPhone,
    _id: { $ne: user._id },
  });

  if (existingPhone) {
    return res.status(409).json({
      success: false,
      message: "Phone number is already in use",
      data: null,
    });
  }

  user.phone = normalizedPhone;
}

await user.save();

return res.status(200).json({
  success: true,
  message: "Profile updated successfully",
  data: {
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      pointsBalance: user.pointsBalance,
    },
  },
});
;
  } catch (error) {
    console.error("Update profile error:", error);

    
if (error.name === "ValidationError") {
  return res.status(400).json({
    success: false,
    message: "Invalid profile details",
    data: null,
  });
}

return res.status(500).json({
  success: false,
  message: "Unable to update profile",
  data: null,
});
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please enter current and new password",
        data: null,
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
        data: null,
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
        data: null,
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
        data: null,
      });
    }

    // Encrypt password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: null,
    });
  } catch (error) {
    console.error("Change Password error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to change password",
      data: null,
    });
  }
};

// Deactivate own Account
exports.deactivateAccount = async (req, res) => {
  try {
    const user = req.user;

    user.isActive = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account deactivated successfully",
      data: null,
    });
  } catch (error) {
    console.error("Deactivate account error:", error);

    return res.status(500).json({
      success: false,
      message: "Deactivation failed",
      data: null,
    });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account from this endpoint",
        data: null,
      });
    }

    user.isActive = false;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User account deactivated successfully",
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to deactivate user account",
      data: null,
    });
  }
};

// Activate user (ADMIN)
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    user.isActive = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User account activated successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to activate user account",
      data: null,
    });
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
        data: null,
      });
    }

    const originalName = req.file.originalname || "";
    const extension = path.extname(originalName).toLowerCase();
    const mimeType = (req.file.mimetype || "").toLowerCase();

    const isHeic =
      [".heic", ".heif"].includes(extension) ||
      [
        "image/heic",
        "image/heif",
        "image/heic-sequence",
        "image/heif-sequence",
      ].includes(mimeType);

    let imageBuffer = req.file.buffer;

    // Convert HEIC/HEIF to JPEG first.
    if (isHeic) {
      imageBuffer = await convert({
        buffer: imageBuffer,
        format: "JPEG",
        quality: 0.9,
      });
    }

    // Decode and normalize the image to JPEG.
    // rotate() respects the photo's orientation metadata.
    const processedImage = await sharp(imageBuffer)
      .rotate()
      .jpeg({ quality: 85 })
      .toBuffer();

    const result = await uploadImageToCloudinary(processedImage);

    req.user.profilePhoto = result.secure_url;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo uploaded successfully.",
      data: {
        profilePhoto: result.secure_url,
      },
    });
  } catch (error) {
    console.error("Upload profile photo error:", error);

    return res.status(400).json({
      success: false,
      message:
        "Unable to process this image. Please try a valid JPG, PNG, WebP, GIF, AVIF, HEIC, or HEIF image.",
      data: null,
    });
  }
};
