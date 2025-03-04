"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"

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
    description: "take your reel time of waiting",
  },
]

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Handle form submission
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

  // Handle Google login
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
    setMessage("Échec de la connexion avec Google.")
  }

  // Image carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="login-container flex min-h-screen bg-gray-50">
      {/* Left side - Image Carousel */}
      <div className="login-carousel-container hidden md:flex md:w-1/2 relative overflow-hidden bg-customindigo">
        {images.map((image, index) => (
          <div
            key={index}
            className={`login-carousel-slide absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col justify-end p-10 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image.url || "/placeholder.svg"}
              alt={image.title}
              className="login-carousel-image absolute inset-0 h-full w-full object-cover"
            />
            <div className="login-carousel-caption relative z-10 bg-black bg-opacity-60 p-6 rounded-lg text-white max-w-md">
              <h3 className="login-carousel-title text-2xl font-bold mb-2">{image.title}</h3>
              <p className="login-carousel-description text-gray-200">{image.description}</p>
            </div>
          </div>
        ))}

        {/* Carousel indicators */}
        <div className="login-carousel-indicators absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              className={`login-carousel-indicator w-3 h-3 rounded-full ${
                index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"
              }`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="login-form-container w-full md:w-1/2 flex items-center justify-center p-4 md:p-10">
        <div className="login-form-wrapper w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="login-header text-center mb-8">
            <h2 className="login-title text-3xl font-bold text-gray-800">Welcome Back</h2>
            <p className="login-subtitle text-gray-600 mt-2">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form space-y-6">
            <div className="login-form-field">
              <label className="login-form-label block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                className="login-form-input w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="login-form-field">
              <label className="login-form-label block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="login-form-input w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-300 focus:border-teal-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="login-form-options flex items-center justify-between">
              <div className="login-remember-me flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="login-checkbox h-4 w-4 text-teal-500 focus:ring-teal-400 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="login-checkbox-label ml-2 block text-sm text-gray-700">
                  Remember Me
                </label>
              </div>
              <Link
                to="/forgotpassword"
                className="login-forgot-password text-sm font-medium text-teal-600 hover:text-teal-500"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="login-submit-button w-full bg-gradient-to-r from-teal-400 to-teal-500 text-white py-3 rounded-lg font-medium shadow-md hover:from-teal-500 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="login-button-loading flex items-center justify-center">
                  <svg
                    className="login-spinner animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Connexion en cours...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="login-divider mt-6">
            <div className="login-divider-line relative">
              <div className="login-divider-line-inner absolute inset-0 flex items-center">
                <div className="login-divider-line-bar w-full border-t border-gray-300"></div>
              </div>
              <div className="login-divider-text relative flex justify-center text-sm">
                <span className="login-divider-text-inner px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="login-social-login mt-6">
              <GoogleOAuthProvider clientId="681587327914-bh8qlfn9kr76hci8d4n0v1mces8ac0r0.apps.googleusercontent.com">
                <div className="login-google-container flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginFailure}
                    useOneTap
                    theme="filled_blue"
                    shape="pill"
                    text="signin_with"
                    size="large"
                  />
                </div>
              </GoogleOAuthProvider>
            </div>
          </div>

          {message && (
            <div
              className={`login-message mt-6 p-3 rounded-lg ${message.includes("réussie") ? "login-message-success bg-green-100 text-green-700" : "login-message-error bg-red-100 text-red-700"}`}
            >
              {message}
            </div>
          )}

          <p className="login-signup-prompt text-center mt-8 text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="login-signup-link font-medium text-teal-600 hover:text-teal-500">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

