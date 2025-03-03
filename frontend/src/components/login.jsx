import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8089/api/auth/login",
        { email, password },
        { withCredentials: true } // Ensures cookies are stored
      );
      const userData = response.data.user;
      userData.profilePicture = userData.gender === "male" ? "/images/male.jpg" : "/images/female.jpg";

      // Store user info in session storage (alternative to localStorage)
      sessionStorage.setItem("user", JSON.stringify(userData));

      setMessage(`Connexion réussie ! Bienvenue, ${userData.username}`);

      if (userData.role === "Patient") {
        navigate("/home");
      } else {
        navigate("/dashboard");
      }
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

  const handleGoogleLoginFailure = () => {
    setMessage("Échec de l'authentification Google");
  };

  return (
    <div className="d-flex vh-100 bg-light  ">
      <div className="col-md-6 d-flex flex-column align-items-center justify-content-center text-white"
        style={{ backgroundColor: "#6DDCCF" }}>
        <h1 className="mb-4">ED</h1>
        <img src="/images/image1.png" alt="Project Logo" className="mb-4 rounded shadow-lg img-fluid" style={{ maxWidth: "300px" }} />
        <h2 className="mb-2">Emergency departments </h2>
        <p className="text-center">providing healthcare to different patient categories</p>
      </div>

      <div className="col-md-6 d-flex flex-column justify-content-center p-5 bg-white shadow">
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

        <GoogleOAuthProvider clientId="681587327914-bh8qlfn9kr76hci8d4n0v1mces8ac0r0.apps.googleusercontent.com">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
          />
        </GoogleOAuthProvider>

        {message && <div className={`alert ${message.includes("réussie") ? "alert-success" : "alert-danger"} mt-3`}>{message}</div>}

        <p className="text-center mt-3">
          Don't have an account? <Link to="/register" className="text-primary">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;