import { Link } from "react-router-dom"
import { FaLocationArrow, FaPhone, FaAmbulance, FaHospital, FaFirstAid } from "react-icons/fa"
import { MdEmail, MdEmergency } from "react-icons/md"
import { BsClockFill } from "react-icons/bs"
import "./footer.css"

const Footer = () => {
  const hours = [{ id: 1, day: "Monday-Saturday", time: "24/24" }]

  return (
    <footer className="footer_container bg-gray-800 text-white py-4 relative z-20">
      {/* Emergency Banner */}
      <div className="emergency-contact-banner ">
        <div className="emergency-contact-item">
          <FaAmbulance className="emergency-icon pulse-icon" />
          <div>
            <h3>Emergency Hotline</h3>
            <a href="tel:+21656800822">+216 56 800 822</a>
          </div>
        </div>
        <div className="emergency-contact-item">
          <MdEmergency className="emergency-icon" />
          <div>
            <h3>24/7 Emergency</h3>
            <p>Always Available</p>
          </div>
        </div>
        <div className="emergency-contact-item">
          <FaFirstAid className="emergency-icon" />
          <div>
            <h3>Urgent Care</h3>
            <Link to="/emergency-register">Register Now</Link>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer_content">
        <div className="footer_section footer_about">
          <div className="footer_logo">
            <img src="./images/logo1.png" alt="Emergency Department Logo" className="footer_logo-img" />
            <div className="footer_logo-text">
              <span className="footer_logo-title">EMERGENCY MANAGEMENT</span>
              <span className="footer_logo-subtitle">Healthcare System</span>
            </div>
            <p className="footer_tagline">Providing immediate, life-saving care when every second counts.</p>
          </div>
        </div>

        <div className="footer_section footer_links-section">
          <h4>
            <FaHospital className="footer-icon" /> Quick Links
          </h4>
          <ul className="footer_links">
            <li>
              <Link to={"/"}>
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to={"/emergency-register"}>
                <span>Emergency Services</span>
              </Link>
            </li>
            <li>
              <Link to={"/appointment"}>
                <span>Appointment</span>
              </Link>
            </li>
            <li>
              <Link to={"/document"}>
                <span>Medical Documents</span>
              </Link>
            </li>
            <li>
              <Link to={"/about"}>
                <span>About Us</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer_section footer_hours-section">
          <h4>
            <BsClockFill className="footer-icon" /> Hours & Contact
          </h4>
          <div className="footer_hours-container">
            <div className="footer_hours-list">
              {hours.slice(0, 3).map((element) => (
                <div key={element.id} className="hour-item">
                  <span className="day">{element.day}</span>
                  <span className="time">{element.time}</span>
                </div>
              ))}
            </div>
            <div className="footer_contact">
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
              <address>Ariana, Tunisia</address>
            </div>
          </div>

          
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer_bottom">
        <p>&copy; {new Date().getFullYear()} Emergency Department. All rights reserved.</p>
        <div className="footer_bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
