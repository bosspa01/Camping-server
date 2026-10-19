const renderError = require("../utils/renderError");
const prisma = require("../config/prisma");
exports.createProfile = async (req, res, next) => {
  try {
    const { firstname, lastname } = req.body;
    const { id } = req.user;
    const email = req.user.emailAddresses[0].emailAddress;

    const profile = await prisma.profile.upsert({
      where: { clerkId: id },
      create: {
        firstname,
        lastname,
        email,
        clerkId: id,
      },
      update: {
        firstname,
        lastname,
        email,
      },
    });

    res.json({
      result: profile,
      message: "Create Profile",
    });
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

exports.readProfile = async (req, res, next) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { clerkId: req.user.id },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        hostApplicationStatus: true,
      },
    });

    if (!profile) {
      return res.status(404).json({
        code: "PROFILE_REQUIRED",
        message: "Please complete your profile",
      });
    }
    res.json({ result: profile });
  } catch (err) {
    next(err);
  }
};

exports.applyHost = async (req, res, next) => {
  try {
    const { role, hostApplicationStatus } = req.profile;

    if (role === "HOST") {
      return res.status(409).json({
        code: "ALREADY_HOST",
        message: "This account is already a host",
      });
    }

    if (hostApplicationStatus === "PENDING") {
      return res.status(409).json({
        code: "APPLICATION_PENDING",
        message: "A host application is already pending",
      });
    }

    const update = await prisma.profile.updateMany({
      where: {
        clerkId: req.user.id,
        role: "USER",
        hostApplicationStatus,
      },
      data: {
        hostApplicationStatus: "PENDING",
      },
    });

    if (update.count === 0) {
      return res.status(409).json({
        code: "APPLICATION_STATUS_CHANGED",
        message: "The host application state has changed",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: { clerkId: req.user.id },
      select: {
        role: true,
        hostApplicationStatus: true,
      },
    });
    res.status(202).json({
      result: profile,
      message: "Host Application Submitted",
    });
  } catch (err) {
    next(err);
  }
};
