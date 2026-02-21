import { useUser } from "@clerk/clerk-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../lib/api";
import { FaCheck, FaTrash, FaHotel, FaWallet, FaClipboardList, FaExternalLinkAlt, FaUserPlus, FaUserShield, FaChartLine, FaCircle } from "react-icons/fa";
import "./Dashboard.css";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  // State Management
  const [stats, setStats] = useState({ totalListings: 0, totalBookings: 0, totalEarnings: 0 });
  const [adminAnalytics, setAdminAnalytics] = useState({ totalGlobalEarnings: 0, totalProperties: 0, totalGlobalBookings: 0, hotelStats: [] });
  const [pendingHotels, setPendingHotels] = useState([]);
  const [ownerList, setOwnerList] = useState([]); 
  const [myHotels, setMyHotels] = useState([]);
  const [newOwnerEmail, setNewOwnerEmail] = useState("");
  const [loading, setLoading] = useState(true);

  // Admin Check Logic - memoized to prevent unnecessary re-renders
  const ADMIN_EMAIL = "razikh1811@gmail.com";
  const isAdmin = useMemo(() => {
    return user?.primaryEmailAddress?.emailAddress?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
  }, [user]);

  useEffect(() => {
    // CRITICAL: Wait for Clerk to finish loading before attempting to fetch data
    if (!isLoaded || !isSignedIn || !user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        if (isAdmin) {
          // ADMIN DATA FETCHING
          // We wrap this in a try-catch specifically to see if one of these 3 fails
          const [pendingRes, ownersRes, analyticsRes] = await Promise.all([
            axios.get(`${API_BASE}/api/hotels/admin/pending`),
            axios.get(`${API_BASE}/api/hotels/admin/owners`),
            axios.get(`${API_BASE}/api/hotels/admin/analytics`)
          ]);
          
          setPendingHotels(pendingRes.data);
          setOwnerList(ownersRes.data || []);
          setAdminAnalytics(analyticsRes.data);
        } else {
          // OWNER DATA FETCHING
          const [statsRes, hotelsRes] = await Promise.all([
            axios.get(`${API_BASE}/api/hotels/owner-stats/${user.id}`),
            axios.get(`${API_BASE}/api/hotels/owner/${user.id}`)
          ]);
          setStats(statsRes.data);
          setMyHotels(hotelsRes.data);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoaded, isSignedIn, user, isAdmin]); // Effect triggers as soon as isAdmin is verified

  // --- ADMIN ACTIONS ---
  const handleApprove = async (id) => {
    try {
      await axios.patch(`${API_BASE}/api/hotels/admin/approve/${id}`);
      setPendingHotels(prev => prev.filter(h => h._id !== id));
      alert("Property approved and live!");
    } catch (err) {
      alert("Approval failed.");
    }
  };

  const handleAddOwner = async (e) => {
    e.preventDefault();
    if (!newOwnerEmail) return;
    try {
      await axios.post(`${API_BASE}/api/hotels/admin/add-owner`, { email: newOwnerEmail });
      const res = await axios.get(`${API_BASE}/api/hotels/admin/owners`);
      setOwnerList(res.data);
      setNewOwnerEmail("");
      alert("Owner authorized!");
    } catch (err) {
      alert(err.response?.data?.error || "Error adding owner.");
    }
  };

  const removeOwner = async (id) => {
    if (!window.confirm("Remove this owner's authorization?")) return;
    try {
      await axios.delete(`${API_BASE}/api/hotels/admin/owner/${id}`);
      setOwnerList(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      alert("Failed to remove owner.");
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm("Are you sure you want to remove this listing?")) return;
    try {
      await axios.delete(`${API_BASE}/api/hotels/${id}`);
      setMyHotels(prev => prev.filter(h => h._id !== id));
      alert("Listing removed.");
    } catch (err) {
      alert("Delete failed.");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="loading-container">
        <div className="luxury-loader"></div>
        <p>Synchronizing ZikhStay {isAdmin ? "Control Center" : "Vault"}...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-text">
          <h1>{isAdmin ? "Control Center" : "Owner Dashboard"}</h1>
          <p>{isAdmin ? "Platform Analytics & Partner Authorization" : "Manage your luxury listings and track revenue"}</p>
        </div>
        {!isAdmin && (
          <button className="btn-gold" onClick={() => navigate('/add-hotel')}>
            + List New Property
          </button>
        )}
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <FaWallet className="stat-icon" />
          <div>
            <label>{isAdmin ? "Global Revenue" : "Total Revenue"}</label>
            <h2>₹{(isAdmin ? adminAnalytics.totalGlobalEarnings : stats.totalEarnings).toLocaleString('en-IN')}</h2>
          </div>
        </div>
        <div className="stat-card glass-card">
          <FaHotel className="stat-icon" />
          <div>
            <label>{isAdmin ? "Total Properties" : "My Properties"}</label>
            <h2>{isAdmin ? adminAnalytics.totalProperties : stats.totalListings}</h2>
          </div>
        </div>
        <div className="stat-card glass-card">
          <FaClipboardList className="stat-icon" />
          <div>
            <label>{isAdmin ? "Total Bookings" : "My Bookings"}</label>
            <h2>{isAdmin ? adminAnalytics.totalGlobalBookings : stats.totalBookings}</h2>
          </div>
        </div>
      </div>

      <main className="dashboard-content">
        {isAdmin ? (
          <>
            {/* Property Income Breakdown */}
            <section className="admin-section">
              <h2 className="section-title"><FaChartLine /> Property Revenue Breakdown</h2>
              <div className="admin-table-container glass-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Hotel Name</th>
                      <th>City</th>
                      <th>Bookings</th>
                      <th>Total Income</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminAnalytics.hotelStats.map(hotel => (
                      <tr key={hotel.id}>
                        <td>{hotel.name}</td>
                        <td>{hotel.city}</td>
                        <td>{hotel.bookingsCount}</td>
                        <td className="text-gold">₹{hotel.totalIncome.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Pending Approvals */}
            <section className="admin-section" style={{ marginTop: '50px' }}>
              <h2 className="section-title"><FaHotel /> Pending Approvals ({pendingHotels.length})</h2>
              <div className="admin-table-container glass-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Property Name</th>
                      <th>City</th>
                      <th>Rate</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingHotels.map(hotel => (
                      <tr key={hotel._id}>
                        <td>{hotel.name}</td>
                        <td>{hotel.city}</td>
                        <td>₹{hotel.pricePerNight}</td>
                        <td>
                          <button onClick={() => handleApprove(hotel._id)} className="btn-approve">
                            <FaCheck /> Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Partner Management */}
            <section className="admin-section" style={{ marginTop: '50px' }}>
              <h2 className="section-title"><FaUserShield /> Authorized Partners ({ownerList.length})</h2>
              <div className="add-owner-box glass-card">
                <form onSubmit={handleAddOwner} className="add-owner-form">
                  <input 
                    type="email" 
                    placeholder="Partner email (e.g. brother@gmail.com)" 
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-gold">
                    <FaUserPlus /> Authorize
                  </button>
                </form>
              </div>

              <div className="admin-table-container glass-card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Partner Email</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerList.map(owner => (
                      <tr key={owner._id}>
                        <td>{owner.email}</td>
                        <td>
                          <span className="status-badge authorized">
                             <FaCircle className="dot-icon" /> Authorized
                          </span>
                        </td>
                        <td>{new Date(owner.addedAt).toLocaleDateString()}</td>
                        <td>
                          <button onClick={() => removeOwner(owner._id)} className="btn-delete-text">
                            <FaTrash /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ownerList.length === 0 && <p className="empty-msg">No partners authorized yet.</p>}
              </div>
            </section>
          </>
        ) : (
          /* Owner's Personal Listing View */
          <section className="owner-section">
            <h2 className="section-title">My Managed Properties</h2>
            <div className="listings-grid">
              {myHotels.map(hotel => (
                <div key={hotel._id} className="mini-hotel-card glass-card">
                  <img src={hotel.images?.main} alt={hotel.name} />
                  <div className="mini-info">
                    <h4>{hotel.name}</h4>
                    <span className={`status-pill ${hotel.isApproved ? 'live' : 'waiting'}`}>
                      {hotel.isApproved ? "● Live" : "○ Pending"}
                    </span>
                  </div>
                  <div className="mini-actions">
                    <button onClick={() => navigate(`/hotel/${hotel._id}`)} className="btn-icon">
                      <FaExternalLinkAlt />
                    </button>
                    <button onClick={() => handleDeleteProperty(hotel._id)} className="btn-icon delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}