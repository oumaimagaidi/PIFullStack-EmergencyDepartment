import "../App.css";

import React, { useEffect } from "react";

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
  
const newsArray = [
  {
    title: "AI Revolutionizes Healthcare Delivery",
    description: "UnitedHealth Group deploys 1,000 AI applications to enhance insurance, health delivery, and pharmacy services, improving patient outcomes.",
    date: "May 5, 2025",
    source: "PYMNTS.com",
    link: "https://www.pymnts.com",
    image: "https://picsum.photos/id/2/800/450" 
                                                
  },
  {
    title: "Mental Health Investments Delayed",
    description: "55% of healthcare organizations postpone mental health initiatives due to tariff-driven supply chain issues, highlighting gaps in global health governance.",
    date: "May 7, 2025",
    source: "ResearchAndMarkets.com",
    link: "https://finance.yahoo.com",
    image: "https://picsum.photos/id/1015/800/450" 
                                                
  },
  {
    title: "Wearable Healthcare Market Booms",
    description: "The smart wearable healthcare devices market is projected to reach USD 37.4 billion by 2028, driven by IoMT and proactive patient monitoring.",
    date: "May 2, 2025",
    source: "PR Newswire",
    link: "https://www.excellentwebworld.com",
    image: "https://picsum.photos/id/160/800/450" // Image d'une montre ou d'un objet technologique (ID 160 est une smartwatch)
                                                // Alternative: https://picsum.photos/seed/wearabletech/800/450
  },
  {
    title: "Data Breach Exposes Millions",
    description: "Blue Shield of California confirms the largest healthcare data breach of 2025, affecting 4.7 million patients due to a misconfigured Google Analytics setup.",
    date: "April 24, 2025",
    source: "TheStreet",
    link: "https://www.thestreet.com",
    image: "https://picsum.photos/id/0/800/450" 
  },
 
  {
    title: "Telemedicine Adoption Skyrockets",
    description: "A new report shows a 300% increase in telemedicine consultations in the last quarter, driven by convenience and accessibility.",
    date: "May 10, 2025",
    source: "Healthcare IT News",
    link: "https://www.healthcareitnews.com",
    image: "https://picsum.photos/id/200/800/450" 
  },
  {
    title: "Breakthrough in Cancer Research",
    description: "Scientists announce a promising new therapy showing significant results in early-stage clinical trials for a common type of cancer.",
    date: "May 12, 2025",
    source: "Nature Medicine",
    link: "https://www.nature.com/nm/",
    image: "https://picsum.photos/id/30/800/450"  
  }
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
  useEffect(() => {
    const canvas = document.querySelector(".particles-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }

      draw() {
        ctx.fillStyle = "rgba(66, 165, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
                <Link
                to={service.name === "Patient Feedback" ? "/feedback" : `/${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="service-link"
              >
                Learn More
              </Link>
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
        
{/* News Section Styles */}
<style>
        {`
          .news-section {
            padding: 80px 20px;
            background: linear-gradient(135deg, #e6f0fa 0%, #d4e4f7 100%);
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .news-section .section-header {
            margin-bottom: 50px;
            position: relative;
            z-index: 2;
          }

          .news-section .section-header h2 {
            font-size: 3rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 700;
            background: linear-gradient(90deg, #0056b3, #42a5ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
          }

          .news-section .section-header p {
            font-size: 1.2rem;
            font-family: 'Roboto', sans-serif;
            color:rgb(10, 15, 63);
            max-width: 700px;
            margin: 0 auto;
            font-weight: 300;
          }

          .news-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
            max-width: 1400px;
            margin: 0 auto;
            position: relative;
            z-index: 1;
          }

          .news-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            overflow: hidden;
            position: relative;
            transform: translateY(calc(var(--card-index) * 10px)) rotate(0deg);
            transition: transform 0.4s ease, box-shadow 0.4s ease;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
            animation: fadeInUp 0.6s ease forwards;
            animation-delay: calc(var(--card-index) * 0.1s);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .news-card:hover {
            transform: translateY(0) scale(1.05);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(66, 165, 255, 0.5);
          }

          .news-image {
            height: 400px;
            background-size: cover;
            background-position: center;
            position: relative;
            display: flex;
            align-items: flex-end;
            transition: background-position 0.5s ease;
          }

          .news-card:hover .news-image {
            background-position: center 20%;
          }

          .news-overlay {
            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%);
            width: 100%;
            padding: 20px;
            color: #fff;
            transition: background 0.3s ease;
          }

          .news-card:hover .news-overlay {
            background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 100%);
          }

          .news-title {
            font-size: 1.8rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 600;
            margin-bottom: 10px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            background: linear-gradient(90deg, #fff, #42a5ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .news-description {
            font-size: 1rem;
            font-family: 'Roboto', sans-serif;
            line-height: 1.5;
            margin-bottom: 15px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .news-meta {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            font-family: 'Roboto', sans-serif;
            font-style: italic;
            margin-bottom: 15px;
          }

          .news-date,
          .news-source {
            color: #ff6f61;
          }

          .news-link {
            display: inline-block;
            font-size: 1.1rem;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            color: #00d4ff;
            text-decoration: none;
            padding: 8px 16px;
            border: 2px solid #00d4ff;
            border-radius: 25px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .news-link:hover {
            background: #00d4ff;
            color: #fff;
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 0 15px rgba(0, 212, 255, 0.5);
          }

          .news-link::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: 0.5s;
          }

          .news-link:hover::before {
            left: 100%;
          }

          .particles-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(50px) rotate(0deg);
            }
            to {
              opacity: 1;
              transform: translateY(calc(var(--card-index) * 10px)) rotate(0deg);
            }
          }

          @media (max-width: 1024px) {
            .news-grid {
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            }
          }

          @media (max-width: 768px) {
            .news-grid {
              grid-template-columns: 1fr;
            }

            .news-card {
              transform: translateY(0) rotate(0deg);
              animation: fadeInUpMobile 0.6s ease forwards;
            }

            .news-image {
              height: 300px;
            }

            .news-section .section-header h2 {
              font-size: 2rem;
            }

            .news-title {
              font-size: 1.5rem;
            }
          }

          @media (max-width: 480px) {
            .news-section .section-header h2 {
              font-size: 1.8rem;
            }
          }

          @keyframes fadeInUpMobile {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      {/* News Section */}
      <section className="news-section">
        <div className="section-header">
          <h2>Health News Unleashed</h2>
          <p>Discover the pulse of healthcare innovation with our latest updates</p>
        </div>
        <div className="news-grid">
          {newsArray.map((news, index) => (
            <div key={index} className={`news-card news-card-${index}`} style={{ '--card-index': index }}>
              <div className="news-image" style={{ backgroundImage: `url(${news.image})` }}>
                <div className="news-overlay">
                  <h4 className="news-title">{news.title}</h4>
                  <p className="news-description">{news.description}</p>
                  <div className="news-meta">
                    <span className="news-date">{news.date}</span>
                    <span className="news-source">Source: {news.source}</span>
                  </div>
                  <a href={news.link} target="_blank" rel="noopener noreferrer" className="news-link">
                    Dive In
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <canvas className="particles-canvas"></canvas>
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