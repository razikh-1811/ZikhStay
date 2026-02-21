const router = require('express').Router();
const mongoose = require('mongoose'); 
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking'); 
const Review = require('../models/Review'); 
const upload = require('../config/cloudinary');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Razorpay = require('razorpay');
const crypto = require('crypto');

// --- OWNER MODEL ---
const OwnerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  addedAt: { type: Date, default: Date.now }
});
const Owner = mongoose.models.Owner || mongoose.model('Owner', OwnerSchema);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// --- AUTHORIZATION CONFIG ---
const ADMIN_EMAIL = "razikh1811@gmail.com";

// --- 0. ROLE & OWNER MANAGEMENT ENDPOINTS ---

router.get('/check-role/:email', async (req, res) => {
  const email = req.params.email.toLowerCase().trim(); // Trim and lower for safety
  if (email === ADMIN_EMAIL.toLowerCase().trim()) return res.json({ role: 'ADMIN' });
  
  const isOwner = await Owner.findOne({ email });
  if (isOwner) return res.json({ role: 'OWNER' });
  
  res.json({ role: 'USER' });
});

router.get('/admin/owners', async (req, res) => {
  try {
    const owners = await Owner.find().sort({ addedAt: -1 });
    res.json(owners);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch owners" });
  }
});

router.post('/admin/add-owner', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const newOwner = new Owner({ email: cleanEmail });
    await newOwner.save();
    res.json({ message: "Owner authorized successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Owner already exists or invalid data." });
  }
});

router.delete('/admin/owner/:id', async (req, res) => {
  try {
    await Owner.findByIdAndDelete(req.params.id);
    res.json({ message: "Owner authorization removed." });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// --- ADMIN GLOBAL ANALYTICS ---
router.get('/admin/analytics', async (req, res) => {
  try {
    const allHotels = await Hotel.find({});
    const allBookings = await Booking.find({ status: 'confirmed' });

    const totalGlobalEarnings = allBookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const hotelStats = allHotels.map(hotel => {
      const hotelBookings = allBookings.filter(b => b.hotelId?.toString() === hotel._id.toString());
      const income = hotelBookings.reduce((acc, curr) => acc + curr.totalAmount, 0);
      return {
        id: hotel._id,
        name: hotel.name,
        city: hotel.city,
        bookingsCount: hotelBookings.length,
        totalIncome: income
      };
    });

    res.json({
      totalGlobalEarnings,
      totalProperties: allHotels.length,
      totalGlobalBookings: allBookings.length,
      hotelStats: hotelStats.sort((a, b) => b.totalIncome - a.totalIncome) 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch global analytics" });
  }
});

// --- 1. Get ALL Hotels ---
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find({ isApproved: true }).sort({ createdAt: -1 });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hotels" });
  }
});

// --- 2. ZikhAI Search Logic ---
router.post('/zikh-ai', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  try {
    const aiPrompt = `Extract city and maxPrice from: "${prompt}". Output ONLY JSON: {"city": "string", "maxPrice": number}. Vizag -> Visakhapatnam.`;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    let responseText = response.text().trim();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI output error");
    
    const filters = JSON.parse(jsonMatch[0]);

    const hotels = await Hotel.find({
      isApproved: true, 
      city: new RegExp(filters.city, 'i'),
      pricePerNight: { $lte: filters.maxPrice || 100000 }
    });

    res.json(hotels);
  } catch (error) {
    const allHotels = await Hotel.find({ isApproved: true }).limit(10);
    res.json(allHotels);
  }
});

// --- 3. Owner Upload ---
router.post('/add', upload.fields([
  { name: 'main', maxCount: 1 },
  { name: 'bedroom', maxCount: 5 },
  { name: 'washroom', maxCount: 5 },
  { name: 'hall', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, city, price, ownerId } = req.body;
    if(!req.files['main']) return res.status(400).json({error: "Main image is required"});

    const images = {
      main: req.files['main'][0].path,
      bedroom: req.files['bedroom']?.map(f => f.path) || [],
      washroom: req.files['washroom']?.map(f => f.path) || [],
      hall: req.files['hall']?.map(f => f.path) || []
    };

    const newHotel = new Hotel({ name, city, pricePerNight: price, images, ownerId, isApproved: false });
    await newHotel.save();
    res.json({ message: "Hotel uploaded and pending admin approval!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- OWNER & ADMIN DASHBOARD ---

router.get('/owner-stats/:ownerId', async (req, res) => {
  try {
    const hotels = await Hotel.find({ ownerId: req.params.ownerId });
    const hotelIds = hotels.map(h => h._id);
    const bookings = await Booking.find({ hotelId: { $in: hotelIds }, status: 'confirmed' });
    const totalEarnings = bookings.reduce((acc, curr) => acc + curr.totalAmount, 0);

    res.json({ totalListings: hotels.length, totalBookings: bookings.length, totalEarnings });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch owner stats" });
  }
});

router.get('/admin/pending', async (req, res) => {
  try {
    const pending = await Hotel.find({ isApproved: false });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending hotels" });
  }
});

router.patch('/admin/approve/:id', async (req, res) => {
  try {
    await Hotel.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.json({ message: "Hotel approved successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Approval failed" });
  }
});

// --- REVIEWS ---

router.get('/reviews/:hotelId', async (req, res) => {
  try {
    const reviews = await Review.find({ hotelId: req.params.hotelId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to load reviews" });
  }
});

router.post('/add-review', async (req, res) => {
  const { hotelId, userId, rating, comment, userName, userImage } = req.body;
  try {
    const hasBooked = await Booking.findOne({ userId, hotelId, status: 'confirmed' });
    if (!hasBooked) return res.status(403).json({ error: "Only verified guests can review." });

    const newReview = new Review({ hotelId, userId, rating, comment, userName, userImage });
    await newReview.save();
    res.json({ message: "Review added!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add review" });
  }
});

// --- 4. Razorpay ---

router.post('/create-order', async (req, res) => {
  const { amount, hotelId, userId } = req.body;
  
  // 1. Strict Validation
  if (!amount || !hotelId || !userId) {
    console.error("❌ Order Creation Failed: Missing fields", { amount, hotelId, userId });
    return res.status(400).json({ error: "Missing required booking details" });
  }

  if (!mongoose.Types.ObjectId.isValid(hotelId)) {
    return res.status(400).json({ error: "Invalid Hotel ID format" });
  }

  // 2. Check if Razorpay is initialized correctly
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("🔥 Razorpay Error: API Keys are missing in .env");
    return res.status(500).json({ error: "Server configuration error: Missing Payment Keys" });
  }

  try {
    // 3. Razorpay Order Creation
    // We use Math.floor and Number() to ensure it's a safe integer for paise
    const options = {
      amount: Math.floor(Number(amount) * 100), 
      currency: "INR",
      receipt: `zikh_rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // 4. Save Pending Booking to MongoDB
    // We store the ownerId/hotelId to ensure the Admin Analytics can track it later
    const newBooking = new Booking({
      hotelId, 
      userId, 
      totalAmount: Number(amount), 
      razorpayOrderId: order.id, 
      status: 'pending'
    });

    await newBooking.save();

    res.json(order);
  } catch (error) {
    // Check your backend console for this specific log
    console.error("🔥 Razorpay Order Crash:", error); 
    res.status(500).json({ 
      error: "Payment initiation failed", 
      message: error.description || error.message 
    });
  }
});

router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ status: "failure", message: "Missing payment signatures" });
  }

  try {
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      // Find the booking and update it to confirmed
      const updatedBooking = await Booking.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { 
          status: 'confirmed', 
          razorpayPaymentId: razorpay_payment_id 
        },
        { new: true }
      );
      
      if (!updatedBooking) {
        console.error("❌ Verification Error: Order ID not found in database", razorpay_order_id);
        return res.status(404).json({ status: "failure", message: "Booking record not found" });
      }

      res.json({ status: "success" });
    } else {
      console.warn("⚠️ Security Alert: Invalid Payment Signature Received");
      res.status(400).json({ status: "failure", message: "Invalid signature" });
    }
  } catch (error) {
    console.error("🔥 Verification Error:", error);
    res.status(500).json({ error: "Internal Server Error during verification" });
  }
});
// --- 5. History & Management ---

router.get('/user-bookings/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId, status: 'confirmed' })
      .populate('hotelId') 
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Error fetching history" });
  }
});

router.get('/owner/:ownerId', async (req, res) => {
  try {
    const hotels = await Hotel.find({ ownerId: req.params.ownerId });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.json({ message: "Property removed." });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: "Not found" });
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;