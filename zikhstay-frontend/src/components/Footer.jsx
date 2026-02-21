import "./Footer.css";

export default function Footer() {
  return (
    <footer className="zikh-footer">
      <div className="footer-content">
        {/* Brand Section */}
        <div className="footer-brand">
          <h2>ZIKHSTAY<span>.</span></h2>
          <p>The smartest way to find your next luxury escape.</p>
        </div>

        {/* Partnership Section - For Owners */}
        <div className="footer-section">
          <h4>Become a Partner</h4>
          <p>Own a luxury property? Reach out to our admin to get authorized as an owner.</p>
          <a 
            href="mailto:razikh1811@gmail.com?subject=ZikhStay Partnership Inquiry" 
            className="footer-contact-btn"
          >
            Contact Admin
          </a>
        </div>

        {/* General Contact Section */}
        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>Visakhapatnam, Andhra Pradesh</p>
          <p>Email: info@zikhstay.com</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 ZikhStay - All Rights Reserved</p>
        <p className="dev-credit">Designed & Developed by Razikh</p>
      </div>
    </footer>
  );
}