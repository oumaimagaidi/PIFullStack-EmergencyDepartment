import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Home = () => {
  const servicesArray = [
    { name: "Emergency", imageUrl: "/images/Emergecy.png" },
    { name: "Medical Document", imageUrl: "/images/electronic_medical_records-removebg-preview.png" },
    { name: "Ambulance Check", imageUrl: "/images/stafambulace.png" },
    { name: "Resources Check", imageUrl: "/images/ressources-removebg-preview.png" },
    { name: "Patient Feedback", imageUrl: "/images/equipe2-removebg-preview.png" },
  ];

  // Configuration du carrousel
  const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3, slidesToSlide: 1 },
    tablet: { breakpoint: { max: 1024, min: 768 }, items: 2, slidesToSlide: 1 },
    mobile: { breakpoint: { max: 768, min: 0 }, items: 1, slidesToSlide: 1 },
  };

  // Flèches personnalisées
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
    <>
      {/* Hero Section */}
      <div className="hero container">
        <div className="banner">
          <h1>Transforming Emergency Care with Smart & Efficient Solutions</h1>
          <p>
            Our Intelligent Emergency Department Management System is designed to revolutionize patient care by optimizing resource allocation, reducing waiting times, and enhancing real-time collaboration among healthcare professionals.
          </p>
          <a href="/emergency-services" className="emergency-btn">Go Emergency Services</a>

        </div>
        <div className="banner">
          <img src="/images/hero.png" alt="hero" className="animated-image" />
          <span>
            <img src="/images/Vector.png" alt="vector" />
          </span>
        </div>
      </div>

      {/* Biography Section */}
      <div className="container biography"> 
        <div className="banner">
          <img src="/images/about.png" alt="whoweare" className="bio-image" />
        </div>
        <div className="banner">
          <p className="bio-title">Biography</p>
          <h3>Who We Are</h3>
          <p>
            Emergency departments (ED) play a crucial role as the first point of contact for patients requiring urgent medical attention.
          </p>
          <p>We are all in 2025!</p>
          <p>We are working on a MERN STACK PROJECT.</p>
        </div>
      </div>

      {/* Services Section */}
      <div className="container services-section">
        <h2 className="text-center fw-bold">Our Services</h2>
        <p className="text-center text-muted">Discover how we can help you</p>

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
              <img src={service.imageUrl} alt={service.name} className="service-image" />
              <h4 className="service-name">{service.name}</h4>
            </div>
          ))}
        </Carousel>
      </div>
    </>
  );
};

export default Home;
