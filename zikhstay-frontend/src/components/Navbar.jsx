import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../lib/api";
import "./Navbar.css";

export default function Navbar() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [role, setRole] = useState("USER"); 
  const [isRoleLoading, setIsRoleLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsRoleLoading(true);
      const email = user.primaryEmailAddress.emailAddress;
      
      // Fetch dynamic role from our new database-driven whitelist
      axios.get(`${API_BASE}/api/hotels/check-role/${email}`)
        .then(res => {
          setRole(res.data.role);
        })
        .catch(err => {
          console.error("Role check failed:", err);
          setRole("USER");
        })
        .finally(() => {
          setIsRoleLoading(false);
        });
    } else {
      setRole("USER");
    }
  }, [user]);

  return (
    <nav className="zikh-nav">
      <Link to="/" className="nav-logo">ZIKHSTAY<span>.</span></Link>
      
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/explore">Explore</Link>

        <SignedIn>
          {/* Prevent showing wrong links while checking role */}
          {!isRoleLoading && (
            <>
              {/* 1. All users can see their own bookings */}
              <Link to="/my-bookings">My Bookings</Link>

              {/* 2. ONLY Authorized Owners/Admins see "List Property" */}
              {/* Added ADMIN here so you can also test the form yourself */}
              {(role === 'OWNER' || role === 'ADMIN') && (
                <Link to="/add-hotel" className="nav-highlight">List Property</Link>
              )}

              {/* 3. Admins and Authorized Owners see Dashboard */}
              {(role === 'ADMIN' || role === 'OWNER') && (
                <Link to="/dashboard" className="nav-dashboard">
                  {role === 'ADMIN' ? "Admin Panel" : "Owner Dashboard"}
                </Link>
              )}
            </>
          )}

          <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="nav-auth-btn">Sign In</button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}