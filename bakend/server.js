require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');


dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();


app.use(cors()); 
app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ ZikhStay DB Connected'))
  .catch(err => console.error('❌ DB Connection Error:', err));




app.use('/api/hotels', require('./routes/hotelRoutes'));


app.get('/', (req, res) => {
  res.send('ZikhStay Backend is Running Successfully!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));