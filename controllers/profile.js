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
