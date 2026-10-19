const prisma = require("../config/prisma");
const { findCenter } = require("../utils/findCenter");

exports.listCamping = async (req, res, next) => {
  try {
    const { id } = req.params;
    // console.log(id);
    const campings = await prisma.landmark.findMany({
      include: {
        favorites: {
          where: { profileId: id },
          select: { id: true },
        },
      },
    });
    // console.log(campings);
    const campingWithLike = campings.map((item) => {
      return {
        ...item,
        isFavorite: item.favorites.length > 0,
      };
    });

    // Find Center
    const center = findCenter(campingWithLike);
    // console.log(campingWithLike);
    res.json({ result: campingWithLike, center: center });
  } catch (err) {
    next(err);
  }
};

exports.readCamping = async (req, res, next) => {
  try {
    const { id } = req.params;
    const camping = await prisma.landmark.findFirst({
      where: {
        id: Number(id),
      },
    });
    res.json({ result: camping });
  } catch (error) {
    next(error);
  }
};

exports.createCamping = async (req, res, next) => {
  try {
    const { title, price, description, category, lat, lng, image } = req.body;
    const { id } = req.user;

    const camping = await prisma.landmark.create({
      data: {
        title,
        price,
        description,
        category,
        lat,
        lng,
        public_id: image.public_id,
        secure_url: image.secure_url,
        profileId: id,
      },
    });

    res.json({ message: "Create Camping Success", result: camping });
  } catch (err) {
    next(err);
  }
};

exports.updateCamping = (req, res, next) => {
  try {
    res.send("Hello Controller Update Camping");
  } catch (err) {
    next(err);
  }
};

exports.deleteCamping = (req, res, next) => {
  try {
    res.send("Hello Controller Delete Camping");
  } catch (err) {
    next(err);
  }
};

// Favorite Controller
exports.actionFavorite = async (req, res, next) => {
  try {
    const { campingId, isFavorite } = req.body;
    const { id } = req.user;

    // Add or Remove
    let result;
    if (isFavorite) {
      result = await prisma.favorite.deleteMany({
        where: {
          profileId: id,
          landmarkId: campingId,
        },
      });
    } else {
      result = await prisma.favorite.create({
        data: {
          landmarkId: campingId,
          profileId: id,
        },
      });
    }

    res.json({
      message: isFavorite ? "Remove Favorite Success" : "Add Favorite Success",
      result: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.listFavorites = async (req, res, next) => {
  try {
    const { id } = req.user;
    const favorites = await prisma.favorite.findMany({
      where: { profileId: id },
      include: { landmark: true },
    });

    const favoriteWithLike = favorites.map((item) => {
      return {
        ...item,
        landmark: {
          ...item.landmark,
          isFavorite: true,
        },
      };
    });

    // console.log(favoriteWithLike);
    res.json({ message: "success", result: favoriteWithLike });
  } catch (err) {
    next(err);
  }
};

exports.filterCamping = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const filter = [];
    if (category) {
      filter.push({ category: category });
    }

    if (search) {
      filter.push({ title: { contains: search } });
    }

    const result = await prisma.landmark.findMany({
      where: {
        OR: filter,
      },
      include: {
        favorites: {
          select: { id: true },
        },
      },
    });

    const campingWithLike = result.map((item) => {
      return {
        ...item,
        isFavorite: item.favorites.length > 0,
      };
    });

    // console.log(campingWithLike);

    // Find Center
    const center = findCenter(campingWithLike);
    

    res.json({ result: campingWithLike, center: center });
  } catch (error) {
    next(error);
  }
};
