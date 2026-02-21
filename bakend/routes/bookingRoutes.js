const router = require('express').Router();
const Booking = require('../models/Booking');

// Get bookings for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .sort({ bookedAt: -1 })
      .populate('hotelId', 'name city images pricePerNight');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch bookings.' });
  }
});

module.exports = router;
