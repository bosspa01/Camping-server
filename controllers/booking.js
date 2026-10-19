const prisma = require("../config/prisma");
const { calTotal } = require("../utils/booking");
const renderError = require("../utils/renderError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.listBookings = async (req, res, next) => {
  try {
    const { id } = req.user;

    const bookings = await prisma.booking.findMany({
      where: { profileId: id, paymentStatus: true },
      include: {
        landmark: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: {
        checkIn: "asc",
      }
    });
    // console.log(bookings);

    res.json({ result: bookings });
  } catch (error) {
    next(error);
  }
};

exports.createBooking = async (req, res) => {
  try {
    // Overview
    // Destructuring
    // Delete Booking
    // Find Camping
    // Calculate Total
    // Insert to db
    // Send id booking to react

    // Destructuring
    const { campingId, checkIn, checkOut } = req.body;
    const { id } = req.user;
    // Delete Booking
    await prisma.booking.deleteMany({
      where: {
        profileId: id,
        paymentStatus: false,
      },
    });
    // Find Camping
    const camping = await prisma.landmark.findFirst({
      where: {
        id: campingId,
      },
      select: {
        price: true,
      },
    });
    if (!camping) {
      return renderError(400, "Camping not found");
    }
    // Calculate Total
    const { total, totalNights } = calTotal(checkIn, checkOut, camping.price);
    // console.log(total, totalNights);
    // Insert to db
    const booking = await prisma.booking.create({
      data: {
        profileId: id,
        landmarkId: campingId,
        checkIn,
        checkOut,
        total,
        totalNights,
      },
    });
    // console.log(booking);
    const bookingId = booking.id;
    // Send id booking to react
    res.json({ message: "Booking Success", id: bookingId });
  } catch (err) {
    next(err);
  }
};

exports.checkOut = async (req, res, next) => {
  try {
    const { id } = req.body;

    const booking = await prisma.booking.findFirst({
      where: { id: Number(id) },
      include: {
        landmark: {
          select: {
            id: true,
            secure_url: true,
            title: true,
          },
        },
      },
    });

    if (!booking) {
      return renderError(400, "Booking not found");
    }
    const { total, totalNights, checkIn, checkOut, landmark } = booking;
    const { title, secure_url } = landmark;

    // Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      metadata: { bookingId: booking.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "thb",
            product_data: {
              name: title,
              images: [secure_url],
              description: "ขอบคุณที่ใช้บริการของเรา",
            },
            unit_amount: total * 100,
          },
        },
      ],
      mode: "payment",
      return_url: `http://localhost:5173/user/complete/{CHECKOUT_SESSION_ID}`,
    });
    // console.log(total,totalNights,checkIn,checkOut,landmark,title,secure_url,);
    res.send({ clientSecret: session.client_secret });
  } catch (err) {
    next(err);
  }
};

exports.checkOutStatus = async (req, res, next) => {
  try {
    const { session_id } = req.params;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const bookingId = session.metadata?.bookingId;

    if (session.status !== "complete" || !bookingId) {
      return renderError(400, "Booking not found");
    }

    // Update DB paymentStatus => true

    const result = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: { paymentStatus: true },
    });

    res.json({ message: "Payment Success", status: session.status });
  } catch (err) {
    next(err);
  }
};
