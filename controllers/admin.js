const prisma = require("../config/prisma");

exports.listStats = async (req, res, next) => {
  try {
    const usersCount = await prisma.profile.count();
    const campingsCount = await prisma.landmark.count();
    const bookingsCount = await prisma.booking.count({
      where: {
        paymentStatus: true,
      },
    });
    res.json({
      usersCount: usersCount,
      campingsCount: campingsCount,
      bookingsCount: bookingsCount,
    });
  } catch (error) {
    next(error);
  }
};

exports.listReservations = async (req, res, next) => {
  try {
    const { id } = req.user;
    // Count Campings
    const campings = await prisma.landmark.count({
      where: {
        profileId: id,
      },
    });

    // Count Nights
    // Totals
    const totals = await prisma.booking.aggregate({
      where: {
        landmark: {
          profileId: id,
        },
      },
      _sum: {
        totalNights: true,
        total: true,
      },
    });

    // console.log(totals);
    res.json({
      campings: campings,
      nights: totals._sum.totalNights,
      totals: totals._sum.total,
    });
  } catch (error) {
    next(error);
  }
};

exports.listAllReservations = async (req, res, next) => {
  try {
    const { id } = req.user;
    const reservations = await prisma.booking.findMany({
      where: {
        paymentStatus: true,
        landmark: {
          profileId: id,
        },
      },
      include: {
        landmark: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // console.log(reservations);
    res.json({ result: reservations });
  } catch (error) {
    next(error);
  }
};

exports.listMyCampings = async (req, res, next) => {
  try {
    const { id } = req.user;
    const campings = await prisma.landmark.findMany({
      where: {
        profileId: id,
      },
      select: {
        id: true,
        title: true,
        price: true,
      },
    });
    res.json({ result: campings });
  } catch (error) {
    next(error);
  }
};

exports.listHostApplications = async (req, res, next) => {
  try {
    const applications = await prisma.profile.findMany({
      where: {
        role: "USER",
        hostApplicationStatus: "PENDING",
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json({ result: applications });
  } catch (error) {
    next(error);
  }
};

exports.decideHostApplication = async (req, res, next) => {
  try {
    const profileId = Number(req.params.profileId);
    const { decision } = req.body;

    if (!Number.isSafeInteger(profileId) || profileId <= 0) {
      return res.status(400).json({
        code: "INVALID_PROFILE_ID",
        message: "Invalid profile id",
      });
    }

    if (decision !== "approve" && decision !== "reject") {
      return res.status(400).json({
        code: "INVALID_DECISION",
        message: "Decision must be approve or reject",
      });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        id: profileId,
      },
      select: {
        id: true,
        role: true,
        hostApplicationStatus: true,
      },
    });

    if (!profile) {
      return res.status(404).json({
        code: "PROFILE_NOT_FOUND",
        message: "Profile not found",
      });
    }

    const update = await prisma.profile.updateMany({
      where: {
        id: profileId,
        role: "USER",
        hostApplicationStatus: "PENDING",
      },
      data:
        decision === "approve"
          ? {
              role: "HOST",
              hostApplicationStatus: "NONE",
            }
          : {
              hostApplicationStatus: "REJECTED",
            },
    });

    if (update.count === 0) {
      return res.status(409).json({
        code: "APPLICATION_NOT_PENDING",
        message: "This application is no longer pending",
      });
    }

    const result = await prisma.profile.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        role: true,
        hostApplicationStatus: true,
      },
    });
    res.json({
      result: result,
      message:
        decision === "approve"
          ? "Host application approved"
          : "Host application rejected",
    });
  } catch (error) {
    next(error);
  }
};
