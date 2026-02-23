require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Atlas DNS issues on certain hosting providers
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// --- 1. CONFIGURE CORS FOR PRODUCTION ---
// This allows your specific Netlify site to talk to Render
app.use(cors({
  origin: [
    "https://zikhstay.netlify.app/", // Replace with your actual Netlify URL
    "http://localhost:5173"                  // Keep local development working
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));

app.use(express.json()); 

// --- 2. DATABASE CONNECTION ---
// Ensure MONGO_URI is set in Render's "Environment" tab
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ ZikhStay DB Connected'))
  .catch(err => {
    console.error('❌ DB Connection Error:', err);
    // On Render, if DB fails, the service should ideally exit so Render can restart it
    process.exit(1); 
  });

// --- 3. ROUTES ---
app.use('/api/hotels', require('./routes/hotelRoutes'));

app.get('/', (req, res) => {
  res.send('ZikhStay Backend is Running Successfully!');
});

// --- 4. PORT HANDLING ---
// Render automatically assigns a PORT. process.env.PORT is mandatory.
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server active on port ${PORT}`);
});
