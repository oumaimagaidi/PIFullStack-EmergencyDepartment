import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const Departments = () => {
  const departmentsArray = [
    { name: "Emergency", imageUrl: "/public/images/Emergecy.png" },
    { name: "Medical Document", imageUrl: "/public/images/electronic_medical_records-removebg-preview.png" },
    { name: "Ambulance Check", imageUrl: "/public/images/stafambulace.png" },
    { name: "Resources Check", imageUrl: "/public/images/ressources.jpg" },
    { name: "Patient Feedback", imageUrl: "/public/images/equipe2-removebg-preview.png" },
  ];
  
console.log("xxxxxxx");
  const responsive = {
    extraLarge: { breakpoint: { max: 3000, min: 1324 }, items: 4, slidesToSlide: 1 },
    large: { breakpoint: { max: 1324, min: 1005 }, items: 3, slidesToSlide: 1 },
    medium: { breakpoint: { max: 1005, min: 700 }, items: 2, slidesToSlide: 1 },
    small: { breakpoint: { max: 700, min: 0 }, items: 1, slidesToSlide: 1 },
  };

  return (
    <div className="container departments">
      <h2>Services</h2>
      <Carousel responsive={responsive} removeArrowOnDeviceType={["tablet", "mobile"]}>
        {departmentsArray.map((depart, index) => (
          <div key={index} className="card">
            <div className="depart-name">{depart.name}</div>
            {depart.imageUrl ? (
              <img src={depart.imageUrl} alt={depart.name} />
            ) : (
              <p>Image not available</p>
            )}
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Departments;
