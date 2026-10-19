const prisma = require("../config/prisma");
const renderError = require("../utils/renderError");
const { clerkClient } = require("@clerk/express");
exports.authCheck = async (req, res, next) => {
  try {
    const auth = req.auth();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await clerkClient.users.getUser(userId);
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

exports.requireProfile = async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { clerkId: req.user.id },
    });

    if (!profile) {
      return res.status(403).json({
        code: "PROFILE_REQUIRED",
        message: "Please complete your profile",
      });
    }
    req.profile = profile;
    next();
  } catch (err) {
    next(err);
  }
};

exports.requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.profile || !allowedRoles.includes(req.profile.role)) {
    return res.status(403).json({
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    })
  }

  next();
};
