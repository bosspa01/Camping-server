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
