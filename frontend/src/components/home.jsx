import React, { useState, useEffect } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { FaArrowLeft, FaArrowRight, FaCamera, FaComment } from "react-icons/fa";
import "../App.css";
import DonatorForm from "./DonatorForm";

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

  // State to control the visibility of DonatorForm
  const [isFormOpen, setIsFormOpen] = useState(false);

  // State for bot interaction
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBotModalOpen, setIsBotModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [problemAnalysis, setProblemAnalysis] = useState(""); // State for problem analysis

  // Mock fetchDonators for DonatorForm
  const fetchDonators = () => {
    console.log("fetchDonators called (mocked in Home.jsx)");
  };

  // Handle image selection and generate preview
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setApiResponse(null); // Reset response when new image is selected
    setError(null);
    setProblemAnalysis(""); // Reset problem analysis

    // Generate image preview URL
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Clean up preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle query change
  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  // Mock function to analyze the problem based on the query
  const analyzeProblem = (query) => {
    if (query.toLowerCase().includes("hair loss")) {
      return "Hair Loss: Potential causes include genetics, hormonal imbalance, stress, or nutritional deficiencies.";
    } else if (query.toLowerCase().includes("scalp")) {
      return "Scalp Issues: Visible dandruff and irritation may indicate conditions like seborrheic dermatitis or psoriasis.";
    }
    return "Problem not identified. Please provide more details.";
  };

  // Call API when bot is clicked
  const handleBotClick = async () => {
    if (!selectedImage) {
      setError("Please select an image first.");
      return;
    }

    if (!query.trim()) {
      setError("Please enter a query.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Analyze the problem based on the query
    const analysis = analyzeProblem(query);
    setProblemAnalysis(analysis);

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("query", query);

    try {
      console.log("Sending request to http://localhost:8000/upload_and_query");
      const response = await fetch("http://localhost:8000/upload_and_query", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }

      const data = await response.json();
      console.log("Received response:", data);
      setApiResponse(data);
    } catch (err) {
      console.error("Error fetching API:", err);
      setError(`Failed to fetch API: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Close the modal
  const closeModal = () => {
    setIsBotModalOpen(false);
    setSelectedImage(null);
    setImagePreview(null);
    setQuery("");
    setApiResponse(null);
    setError(null);
    setProblemAnalysis("");
  };

  return (
    <>
      {/* Hero Section */}
      <div className="hero container">
        <div className="banner">
          <h1>Transforming Emergency Care with Smart & Efficient Solutions</h1>
          <p>
            Our Intelligent Emergency Department Management System is designed to revolutionize patient care by optimizing resource allocation, reducing waiting times, and enhancing real-time collaboration among healthcare professionals.
          </p>
          <div className="flex flex-col items-start gap-4">
            <a href="/emergency-services" className="emergency-btn">
              Go Emergency Services
            </a>
            {/* Blood Donation Image */}
            <img
              src="/images/blood_donation.png"
              alt="Blood Donation"
              className="w-32 h-32 cursor-pointer transition-all duration-300 transform border-2 border-red-300 rounded-full bg-white p-2 hover:shadow-[0_0_20px_5px_rgba(239,68,68,0.5)] hover:-translate-y-5 hover:translate-x-2"
              onClick={() => setIsFormOpen(true)}
            />
            {/* Bot Image */}
            <div className="flex items-center gap-4">
              <img
                src="/bot.png"
                alt="Bot"
                className="w-32 h-32 cursor-pointer transition-all duration-300 transform border-2 border-blue-300 rounded-full bg-white p-2 hover:shadow-[0_0_20px_5px_rgba(59,130,246,0.5)] hover:-translate-y-5 hover:translate-x-2"
                onClick={() => setIsBotModalOpen(true)}
              />
            </div>
          </div>
        </div>
        <div className="banner">
          <img src="/images/hero.png" alt="hero" className="animated-image" />
          <span>
            <img src="/images/Vector.png" alt="vector" />
          </span>
        </div>
      </div>

      {/* Bot Modal */}
      {isBotModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-200 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Side: Upload Image */}
              <div className="w-full md:w-1/2 bg-gray-700 p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-purple-300 flex items-center">
                    <FaCamera className="mr-2" /> Upload Image
                  </h4>
                </div>
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => document.getElementById("imageInput").click()}
                    className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition duration-300 flex items-center w-full text-center justify-center"
                  >
                    Click to Upload
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageInput"
                />
                {imagePreview && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-48 object-contain rounded-lg border border-gray-600 shadow-md"
                    />
                  </div>
                )}
                {apiResponse && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-gray-600 rounded-lg border border-green-500 max-h-40 overflow-y-auto">
                      <span className="font-bold text-green-300">LLaMA 3.2-11b-vision Response:</span>
                      <p className="text-gray-100 mt-2">{apiResponse.llama11b}</p>
                    </div>
                    <div className="p-4 bg-gray-600 rounded-lg border border-green-500 max-h-40 overflow-y-auto">
                      <span className="font-bold text-green-300">LLaMA 3.2-90b-vision Response:</span>
                      <p className="text-gray-100 mt-2">{apiResponse.llama90b}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Ask Question */}
              <div className="w-full md:w-1/2 bg-gray-700 p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-blue-300 flex items-center">
                    <FaComment className="mr-2" /> Ask Question
                  </h4>
                </div>
                <textarea
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Enter your question about the image"
                  className="w-full h-32 p-3 bg-gray-600 text-white rounded-lg border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4"
                />
                <button
                  onClick={handleBotClick}
                  className={`w-full bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition duration-300 flex items-center justify-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <span>Submit Query</span>
                      <span className="ml-2">🚀</span>
                    </>
                  )}
                </button>
                {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* DonatorForm Modal */}
      {isFormOpen && (
        <DonatorForm onClose={() => setIsFormOpen(false)} fetchDonators={fetchDonators} />
      )}
    </>
  );
};

export default Home;