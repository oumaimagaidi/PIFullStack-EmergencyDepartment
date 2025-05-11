import { Link } from "react-router-dom"
import { FaPhone, FaLocationArrow, FaHospital, FaAmbulance, FaFirstAid, FaClock } from "react-icons/fa"
import { MdEmail, MdEmergency } from "react-icons/md"
import "./footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      {/* Emergency Banner */}

      <div className="emergency-banner bg-opacity-95 backdrop-blur-sm border-gray-100 relative"style={{ backgroundColor: '#1e3a8a' }}>
        <div className="container">
          <div className="emergency-items">
            <div className="emergency-item">
              <div className="emergency-icon">
                <FaAmbulance />
              </div>
              <div className="emergency-info">
                <h3>Emergency Hotline</h3>
                <a href="tel:+21656800822">+216 56 800 822</a>
              </div>
            </div>

            <div className="emergency-item">
              <div className="emergency-icon">
                <MdEmergency />
              </div>
              <div className="emergency-info">
                <h3>24/7 Emergency</h3>
                <p>Always Available</p>
              </div>
            </div>

            <div className="emergency-item">
              <div className="emergency-icon">
                <FaFirstAid />
              </div>
              <div className="emergency-info">
                <h3>Urgent Care</h3>
                <Link to="/emergency-register">Register Now</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            {/* About Section */}
            <div className="footer-section">
              <div className="footer-logo">
                <h2>EMERGENCY MANAGEMENT</h2>
                <p className="subtitle">HEALTHCARE SYSTEM</p>
              </div>
              <p className="tagline">Providing immediate, life-saving care when every second counts.</p>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3 className="footer-heading">
                <FaHospital className="heading-icon" /> Quick Links
              </h3>
              <ul className="footer-links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/emergency-register">Emergency Services</Link>
                </li>
                <li>
                  <Link to="/appointment">Appointment</Link>
                </li>
                <li>
                  <Link to="/document">Medical Documents</Link>
                </li>
                <li>
                  <Link to="/about">About Us</Link>
                </li>
              </ul>
            </div>

            {/* Hours & Contact */}
            <div className="footer-section">
              <h3 className="footer-heading">
                <FaClock className="heading-icon" /> Hours & Contact
              </h3>

              <div className="hours-container">
                <div className="hours-item">
                  <span>Monday-Saturday</span>
                  <span>24/24</span>
                </div>
                <div className="emergency-hours">
                  <span>Emergency Services</span>
                  <span>24/7</span>
                </div>
              </div>

              <div className="contact-info">
                <div className="contact-item">
                  <FaPhone className="contact-icon" />
                  <a href="tel:+21656800822">+216 56 800 822</a>
                </div>
                <div className="contact-item">
                  <MdEmail className="contact-icon" />
                  <a href="mailto:Edepartement@gmail.com">Edepartement@gmail.com</a>
                </div>
                <div className="contact-item">
                  <FaLocationArrow className="contact-icon" />
                  <span>Ariana, Tunisia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Emergency Department. All rights reserved.</p>
          <div className="bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
