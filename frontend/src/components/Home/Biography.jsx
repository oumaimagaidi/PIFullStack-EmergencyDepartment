import React from "react";

const Biography = ({imageUrl}) => {
  return (
    <>
      <div className="container biography">
        <div className="banner">
          <img src={imageUrl} alt="whoweare" />
        </div>
        <div className="banner">
          <p>Biography</p>
          <h3>Who We Are</h3>
          <p>
          Emergency departments (ED) play a crucial role as the first point of contact for patients requiring urgent medical attention. Our mission is to enhance emergency care by addressing key challenges such as overcrowding, resource limitations, and patient flow management. We are committed to developing an intelligent, real-time web application that facilitates seamless communication between emergency personnel, including doctors, nurses, triage staff, and ambulance drivers. By integrating advanced data-sharing models and AI-driven predictive analytics, our system aims to improve response times, optimize resource allocation, and ensure efficient patient care.
          </p>
          <p>We are all in 2025!</p>
          <p>We are working on a MERN STACK PROJECT.</p>
      
        </div>
      </div>
    </>
  );
};

export default Biography;
