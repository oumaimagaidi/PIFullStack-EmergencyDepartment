import { Link } from "react-router-dom"
import { FaLocationArrow, FaPhone, FaAmbulance, FaHospital, FaFirstAid } from "react-icons/fa"
import { MdEmail, MdEmergency, MdLocalHospital } from "react-icons/md"
import { BsClockFill } from "react-icons/bs"
import "./footer.css"
const Footer = () => {
  const hours = [
    { id: 1, day: "Monday", time: "9:00 AM - 11:00 PM" },
    { id: 2, day: "Tuesday", time: "12:00 PM - 12:00 AM" },
    { id: 3, day: "Wednesday", time: "10:00 AM - 10:00 PM" },
    { id: 4, day: "Thursday", time: "9:00 AM - 9:00 PM" },
    { id: 5, day: "Friday", time: "3:00 PM - 9:00 PM" },
    { id: 6, day: "Saturday", time: "9:00 AM - 3:00 PM" },
  ]

  return (
    <footer className="footer_container">
      <div className="emergency-contact-banner">
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

      <div className="footer_content">
        <div className="footer_section footer_about">
          <div className="footer_logo">
            <img src="./images/logo1.png" alt="Emergency Department Logo" className="footer_logo-img" />
          </div>
          <p className="footer_tagline">Providing immediate, life-saving care when every second counts.</p>
          <div className="footer_social">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        <div className="footer_section">
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

        <div className="footer_section">
          <h4>
            <BsClockFill className="footer-icon" /> Opening Hours
          </h4>
          <ul className="footer_hours">
            {hours.map((element) => (
              <li key={element.id}>
                <span className="day">{element.day}</span>
                <span className="time">{element.time}</span>
              </li>
            ))}
            <li className="emergency-hours">
              <span className="day">Emergency Care</span>
              <span className="time">24/7</span>
            </li>
          </ul>
        </div>

        <div className="footer_section">
          <h4>
            <MdLocalHospital className="footer-icon" /> Contact Us
          </h4>
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
