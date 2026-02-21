import { Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import MyBookings from "./pages/MyBookings";
import HotelDetails from "./pages/HotelDetails";

// New Partner Pages
import AddHotel from "./components/AddHotel";
import PartnerListings from "./pages/PartnerListing";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />

        {/* --- Shared Private Dashboard (Admin/Owner) --- */}
        <Route 
          path="/dashboard" 
          element={
            <SignedIn>
              <Dashboard />
            </SignedIn>
          } 
        />

        {/* --- Private Guest Routes --- */}
        <Route 
          path="/my-bookings" 
          element={
            <SignedIn>
              <MyBookings />
            </SignedIn>
          } 
        />

        {/* --- Private Partner Routes --- */}
        {/* IMPORTANT: Ensure your Navbar buttons link to these EXACT paths */}
        <Route 
          path="/partner/listings" 
          element={
            <SignedIn>
              <PartnerListings />
            </SignedIn>
          } 
        />
        
        <Route 
          path="/add-hotel" // Changed from /partner/add to match your button logic
          element={
            <SignedIn>
              <AddHotel />
            </SignedIn>
          } 
        />

        {/* --- Redirect unauthenticated users trying to access private routes --- */}
        <Route
          path="/partner/*"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          }
        />

        {/* Catch-all route for 404s */}
        <Route path="*" element={<Explore />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;