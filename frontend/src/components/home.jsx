import "../App.css";
import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { FaArrowLeft, FaArrowRight, FaAmbulance, FaFileMedical, FaHospital } from "react-icons/fa";
import { MdEmergency, MdFeedback, MdInventory } from "react-icons/md";
import { Link } from "react-router-dom";
import ParticlesComponent from "@/components/ParticlesComponent";

const Home = () => {
  const servicesArray = [
    { 
      name: "Emergency Care", 
      imageUrl: "/images/Emergecy.png",
      icon: <MdEmergency className="service-icon" />,
      description: "Immediate medical attention for critical conditions"
    },
    { 
      name: "Medical Documents", 
      imageUrl: "/images/electronic_medical_records-removebg-preview.png",
      icon: <FaFileMedical className="service-icon" />,
      description: "Secure access to patient records and medical history"
    },
    { 
      name: "Ambulance Services", 
      imageUrl: "/images/stafambulace.png",
      icon: <FaAmbulance className="service-icon" />,
      description: "Rapid response emergency transportation"
    },
    { 
      name: "Resource Management", 
      imageUrl: "/images/ressources-removebg-preview.png",
      icon: <MdInventory className="service-icon" />,
      description: "Efficient allocation of medical supplies and equipment"
    },
    { 
      name: "Patient Feedback", 
      imageUrl: "/images/equipe2-removebg-preview.png",
      icon: <MdFeedback className="service-icon" />,
      description: "Continuous improvement through patient insights"
    },
  ];

  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3, slidesToSlide: 1 },
    tablet: { breakpoint: { max: 1024, min: 768 }, items: 2, slidesToSlide: 1 },
    mobile: { breakpoint: { max: 768, min: 0 }, items: 1, slidesToSlide: 1 },
  };

  const CustomLeftArrow = ({ onClick }) => (
    <div className="custom-arrow left-arrow" onClick={onClick}>
      <FaArrowLeft size={24} />
    </div>
  );

  const CustomRightArrow = ({ onClick }) => (
    <div className="custom-arrow right-arrow" onClick={onClick}>
      <FaArrowRight size={24} />
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50 font-sans">
      <div className="fixed inset-0 z-0">
        <ParticlesComponent 
          id="home-particles"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: '#E8F4F8'
          }}
        />
      </div>

      <div className="home-container relative z-10">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <div className="emergency-badge">
                <span className="pulse-dot"></span>
                Emergency Services
              </div>
              <h1>Transforming Emergency Care with Smart Solutions</h1>
              <p>
                Our Intelligent Emergency Department Management System revolutionizes patient care by optimizing resources, 
                reducing waiting times, and enhancing real-time collaboration among healthcare professionals.
              </p>
              <div className="hero-buttons">
  <Link to="/emergency-register" className="emergency-btn">
    Emergency Services
  </Link>
</div>
            </div>
            <div className="hero-image">
              <div className="image-container">
                <img src="/images/hero.png" alt="Emergency care" className="animated-image" />
                <div className="blue-circle"></div>
              </div>
            </div>
          </div>
          
          <div className="stats-bar">
            <div className="stat-item">
              <h3>24/24</h3>
              <p>Emergency Care</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>15 min</h3>
              <p>Avg. Response Time</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>100+</h3>
              <p>Medical Professionals</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>50,000+</h3>
              <p>Patients Served</p>
            </div>
          </div>
        </section>

        <section className="services-section">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Comprehensive emergency care solutions designed for efficiency and patient comfort</p>
          </div>

          <Carousel
            responsive={responsive}
            infinite={true}
            autoPlay={true}
            autoPlaySpeed={3000}
            customLeftArrow={<CustomLeftArrow />}
            customRightArrow={<CustomRightArrow />}
            className="services-carousel"
          >
            {servicesArray.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon-container">
                  {service.icon}
                </div>
                <h4 className="service-name">{service.name}</h4>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </Carousel>
        </section>

        <section className="about-section">
          <div className="about-content">
            <div className="about-image">
              <img src="/images/about.png" alt="Who we are" className="bio-image" />
              <div className="image-accent"></div>
            </div>
            <div className="about-text">
              <div className="section-badge">About Us</div>
              <h2>Who We Are</h2>
              <p className="about-description">
                Emergency departments (ED) play a crucial role as the first point of contact for patients requiring urgent medical attention. 
                Our mission is to revolutionize emergency care through innovative technology and compassionate service.
              </p>
              <div className="about-features">
                <div className="feature">
                  <div className="feature-icon">
                    <FaHospital />
                  </div>
                  <div className="feature-text">
                    <h4>Modern Facilities</h4>
                    <p>State-of-the-art equipment and comfortable environments</p>
                  </div>
                </div>
                <div className="feature">
                  <div className="feature-icon">
                    <MdEmergency />
                  </div>
                  <div className="feature-text">
                    <h4>Rapid Response</h4>
                    <p>Quick and efficient emergency care when seconds count</p>
                  </div>
                </div>
              </div>
              <Link to="/about" className="about-btn-secondary">
                Discover Our Story
              </Link>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-content">
            <h2>Need Emergency Assistance?</h2>
            <p>Our team of medical professionals is ready to provide immediate care</p>
            <Link to="/emergency-register" className="cta-button">
              <MdEmergency className="btn-icon" /> Get Emergency Help
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;