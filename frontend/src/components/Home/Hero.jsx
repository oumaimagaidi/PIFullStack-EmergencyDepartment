import React from "react";
const Hero = ({ title, imageUrl }) => {
  return (
    <>
      <div className="hero container">
        <div className="banner">
          <h1>{title}</h1>
          <p>
            Our Intelligent Emergency Department Management System is designed to revolutionize patient care by optimizing resource allocation, reducing waiting times, and enhancing real-time collaboration among healthcare professionals. With AI-driven predictive analytics and secure electronic health records, we empower emergency departments to provide faster, more accurate, and efficient care to all patients.
          </p>
        </div>
        <div className="banner">
          <img src={imageUrl} alt="hero" className="animated-image" />
          <span>
            <img src="./images/Vector.png" alt="vector" />
          </span>
        </div>
      </div>
    </>
  );
};
export default Hero;
