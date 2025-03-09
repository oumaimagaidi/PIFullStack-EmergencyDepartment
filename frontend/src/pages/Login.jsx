import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";

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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8089/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      const userData = response.data.user;
      userData.profilePicture = userData.gender === "male" ? "/images/male.jpg" : "/images/female.jpg";
      sessionStorage.setItem("user", JSON.stringify(userData));
      setMessage(`Connexion réussie ! Bienvenue, ${userData.username}`);
      userData.role === "Patient" ? navigate("/home") : navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const res = await axios.post("http://localhost:8089/api/auth/google-login", {
        token: response.credential,
      });
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      setMessage("Connexion réussie avec Google !");
      navigate("/home");
    } catch (error) {
      setMessage("Erreur lors de l'authentification Google");
    }
  };

  const handleGoogleLoginFailure = () => setMessage("Échec de l'authentification Google");

  return (
    <div className="d-flex vh-100">
      {/* Left Side - Carousel */}
      <div className="d-none d-md-flex col-md-6 position-relative overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`position-absolute w-100 h-100 transition-opacity ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}
            style={{ transition: "opacity 1s ease-in-out" }}
          >
            <img src={image.url} alt={image.title} className="w-100 h-100 object-fit-cover" />
            <div className="position-absolute bottom-0 p-4 text-white bg-dark bg-opacity-50 w-100">
              <h3 className="mb-1">{image.title}</h3>
              <p>{image.description}</p>
            </div>
          </div>
        ))}

        {/* Indicators */}
        <div className="position-absolute bottom-2 start-50 translate-middle-x d-flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`rounded-circle bg-white ${index === currentImageIndex ? "opacity-100" : "opacity-50"}`}
              style={{ width: "10px", height: "10px", border: "none" }}
              onClick={() => setCurrentImageIndex(index)}
            ></button>
          ))}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="col-12 col-md-6 d-flex flex-column justify-content-center p-5 bg-white shadow">
        <h2 className="mb-3">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="d-flex justify-content-between mb-3">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="rememberMe" />
              <label className="form-check-label" htmlFor="rememberMe">Remember Me</label>
            </div>
            <Link to="/forgotpassword" className="text-primary">Forgot Password?</Link>
          </div>
          <button
            type="submit"
            className="btn w-100"
            style={{ backgroundColor: "#6DDCCF", borderColor: "#6DDCCF", color: "white" }}
            disabled={isLoading}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-3 text-center">Or</div>

        <GoogleOAuthProvider clientId="681587327914-bh8qlfn9kr76hci8d4n0v1mces8ac0r0.apps.googleusercontent.com">
          <div className="d-flex justify-content-center mt-3">
            <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginFailure} />
          </div>
        </GoogleOAuthProvider>

        {message && (
          <div className={`alert mt-3 ${message.includes("réussie") ? "alert-success" : "alert-danger"}`}>
            {message}
          </div>
        )}

        <p className="text-center mt-3">
          Don't have an account? <Link to="/register" className="text-primary">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
