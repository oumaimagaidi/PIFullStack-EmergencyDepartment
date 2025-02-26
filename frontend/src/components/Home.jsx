import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Card } from "react-bootstrap";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa"; // Icônes de navigation

const Home = () => {
  const departmentsArray = [
    { name: "Emergency", imageUrl: "/images/Emergecy.png" },
    { name: "Medical Document", imageUrl: "/images/electronic_medical_records-removebg-preview.png" },
    { name: "Ambulance Check", imageUrl: "/images/stafambulace.png" },
    { name: "Resources Check", imageUrl: "/images/ressources-removebg-preview.png" },
    { name: "Patient Feedback", imageUrl: "/images/equipe2-removebg-preview.png" },
  ];

  // Configuration du carrousel
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3, // Affiche 3 cartes à la fois
      slidesToSlide: 1, // Défile une carte à la foisc
    },
    tablet: {
      breakpoint: { max: 1024, min: 768 },
      items: 2, // Affiche 2 cartes à la fois
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 768, min: 0 },
      items: 1, // Affiche 1 carte à la fois
      slidesToSlide: 1,
    },
  };

  // Icônes de navigation personnalisées
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
            Our Intelligent Emergency Department Management System is designed to revolutionize patient care by optimizing resource allocation, reducing waiting times, and enhancing real-time collaboration among healthcare professionals. With AI-driven predictive analytics and secure electronic health records, we empower emergency departments to provide faster, more accurate, and efficient care to all patients.
          </p>
        </div>
        <div className="banner">
          <img src="./images/hero.png" alt="hero" className="animated-image" />
          <span>
            <img src="./images/Vector.png" alt="vector" />
          </span>
        </div>
      </div>

      {/* Biography Section */}
      <div className="container biography">
        <div className="banner">
          <img src="./images/about.png" alt="whoweare" />
        </div>
        <div className="banner">
          <p>Biography</p>
          <h3>Who We Are</h3>
          <p>
            Emergency departments (ED) play a crucial role as the first point of contact for patients requiring urgent medical attention. Our mission is to enhance emergency care by addressing key challenges such as overcrowding, resource limitations, and patient flow management.
          </p>
          <p>We are all in 2025!</p>
          <p>We are working on a MERN STACK PROJECT.</p>
        </div>
      </div>

      {/* Services Section */}
      <div className="container departments">
        <h2>Services</h2>
        <Carousel
          responsive={responsive}
          customLeftArrow={<CustomLeftArrow />}
          customRightArrow={<CustomRightArrow />}
          infinite={true} // Défilement infini
          autoPlay={false} // Désactive l'autoplay
          keyBoardControl={true} // Permet la navigation au clavier
          containerClass="carousel-container" // Classe personnalisée pour le conteneur
        >
          {departmentsArray.map((depart, index) => (
            <div key={index} className="card-wrapper">
              <Card className="service-card">
                <Card.Img variant="top" src={depart.imageUrl} alt={depart.name} />
               
                  <Card.Title>{depart.name}</Card.Title>
              
              </Card>
              
            </div>
          ))}
        </Carousel>
      </div>
    </>
  );
};

export default Home;