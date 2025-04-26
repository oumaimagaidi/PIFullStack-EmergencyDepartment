import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "Patient",
    name: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    bloodType: "",
    allergies: "",
    badgeNumber: "",
    specialization: "",
    licenseNumber: "",
    shift: "",
    profileImage: null,
  });
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    {
      url: "/images/logo0.png",
      title: "Welcome to Our Platform",
      description: "Your journey to amazing experiences starts here.",
    },
    {
      url: "/images/imageurg.jpg",
      title: "Discover New Possibilities",
      description: "Unlock your potential with our innovative solutions.",
    },
    {
      url: "/images/25291-removebg-preview.png",
      title: "Connect With Others",
      description: "Take your real time of waiting.",
    },
  ];
  
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Vérifier si les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      }

      // Envoyer les données d'inscription au backend
      const response = await axios.post(
        "http://localhost:8089/api/auth/register",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setMessage("Inscription réussie ! Veuillez vérifier votre email pour l'OTP.");
      setOtpSent(true);
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      setMessage(
        error.response?.data?.message || "Erreur lors de l'inscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post(
        "http://localhost:8089/api/auth/verify-otp",
        {
          email: formData.email,
          otp,
        },
        {
          withCredentials: true,
        }
      );

      setMessage("OTP vérifié avec succès. Vous pouvez maintenant vous connecter.");
      navigate("/login");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Erreur lors de la vérification de l'OTP"
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="d-flex vh-100">
      {/* Left Side - Logo and Carousel */}
      <div className="d-none d-md-flex col-md-6 position-relative overflow-hidden bg-light">
        {/* Carousel Images */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`position-absolute w-100 h-100 transition-opacity ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ transition: "opacity 1s ease-in-out" }}
          >
            <img
              src={image.url || "/placeholder.svg"}
              alt={image.title}
              className="w-100 h-100 object-fit-cover"
              style={{ objectPosition: "center" }}
            />
            <div className="position-absolute bottom-0 p-4 text-white bg-dark bg-opacity-50 w-100">
              <h3 className="mb-1 fs-4">{image.title}</h3>
              <p className="mb-0 fs-6">{image.description}</p>
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="position-absolute bottom-4 start-50 translate-middle-x d-flex gap-2 mb-4">
          {images.map((_, index) => (
            <button
              key={index}
              className={`rounded-circle ${
                index === currentImageIndex ? "bg-primary" : "bg-white opacity-75"
              }`}
              style={{ 
                width: "12px", 
                height: "12px", 
                border: "none", 
                cursor: "pointer" 
              }}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="col-md-6 d-flex flex-column justify-content-center p-5 bg-white shadow">
        <h2 className="mb-3">Sign Up</h2>
        <p className="text-muted">
          Create your account by filling out the information below.
        </p>

        {!otpSent ? (
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <input
                  type="text"
                  name="username"
                  placeholder="Nom d'utilisateur"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmer mot de passe"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Téléphone"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <select
                  name="role"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Médecin</option>
                  <option value="Nurse">Infirmier</option>
                  <option value="Administrator">Administrateur</option>
                </select>
              </div>
              <div className="col-md-6">
                {formData.role === "Patient" && (
                  <>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nom complet"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="gender"
                      placeholder="Genre"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Adresse"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="emergencyContact"
                      placeholder="Contact d'urgence"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="bloodType"
                      placeholder="Groupe sanguin"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="allergies"
                      placeholder="Allergies (optionnel)"
                      className="form-control mb-2"
                      onChange={handleChange}
                    />
                  </>
                )}
                {formData.role === "Doctor" && (
                  <>
                    <input
                      type="text"
                      name="badgeNumber"
                      placeholder="Numéro de badge"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="specialization"
                      placeholder="Spécialisation"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="Numéro de licence"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                  </>
                )}
                {formData.role === "Nurse" && (
                  <>
                    <input
                      type="text"
                      name="badgeNumber"
                      placeholder="Numéro de badge"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="shift"
                      placeholder="Horaire de travail"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="Numéro de licence"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                  </>
                )}
                {formData.role === "Administrator" && (
                  <>
                    <input
                      type="text"
                      name="badgeNumber"
                      placeholder="Numéro de badge"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profileImage">Image de profil</label>
              <input
                type="file"
                name="profileImage"
                id="profileImage"
                className="form-control mb-2"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              style={{
                backgroundColor: "#6DDCCF",
                borderColor: "#6DDCCF",
                color: "white",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Inscription..." : "S'inscrire"}
            </button>

            <div className="mt-3 text-center">
              <span>Déjà un compte ? </span>
              <Link to="/login" className="text-decoration-none">
                Se connecter
              </Link>
            </div>
          </form>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Entrez l'OTP"
              className="form-control mb-2"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              className="btn btn-primary w-100"
              style={{
                backgroundColor: "#6DDCCF",
                borderColor: "#6DDCCF",
                color: "white",
              }}
              onClick={handleVerifyOtp}
            >
              Vérifier l'OTP
            </button>
          </div>
        )}

        {message && (
          <div
            className={`alert ${
              message.includes("réussie") ? "alert-success" : "alert-danger"
            } mt-3`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;