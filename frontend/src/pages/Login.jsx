"use client"
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import "bootstrap/dist/css/bootstrap.min.css"

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
]

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  const navigate = useNavigate()
const recaptchaRef = useRef(null);
  useEffect(() => {
     const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    console.log("reCAPTCHA site key:", siteKey);
    if (!siteKey) {
      console.error("reCAPTCHA site key is not defined in .env file");
      setMessage("Erreur de configuration reCAPTCHA. Veuillez contacter l'administrateur.");
      setRecaptchaLoaded(false);
    } else {
      setRecaptchaLoaded(true);
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post(
        "http://localhost:8089/api/auth/login",
        { email, password },
        { withCredentials: true },
      )
      const userData = response.data.user
      userData.profilePicture = userData.gender === "male" ? "/images/male.jpg" : "/images/female.jpg"
      sessionStorage.setItem("user", JSON.stringify(userData))
      setMessage(`Connexion réussie ! Bienvenue, ${userData.username}`)
      userData.role === "Patient" ? navigate("/home") : navigate("/dashboard")
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const res = await axios.post("http://localhost:8089/api/auth/google-login", {
        token: response.credential,
      })
      localStorage.setItem("user", JSON.stringify(res.data.user))
      localStorage.setItem("token", res.data.token)
      setMessage("Connexion réussie avec Google !")
      navigate("/home")
    } catch (error) {
      setMessage("Erreur lors de l'authentification Google")
    }
  }
const handleRecaptchaChange = (token) => {
    console.log("reCAPTCHA token received:", token);
    if (token) {
      setNotBot(true);
      setMessage("");
    } else {
      setNotBot(false);
      setMessage("Vérification reCAPTCHA expirée. Veuillez réessayer.");
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  };
  const handleRecaptchaError = () => {
    console.error("reCAPTCHA error occurred");
    setNotBot(false);
    setMessage("Erreur de chargement de reCAPTCHA. Vérifiez votre connexion ou contactez l'administrateur.");
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleRecaptchaExpired = () => {
    console.log("reCAPTCHA expired");
    setNotBot(false);
    setMessage("Vérification reCAPTCHA expirée. Veuillez réessayer.");
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };
  const handleGoogleLoginFailure = () => setMessage("Échec de l'authentification Google")

  return (
    <div className="d-flex vh-100">
      {/* Left Side - Logo and Carousel */}
      <div className="d-none d-md-flex col-md-7 position-relative overflow-hidden bg-light">
        {/* Logo Placement */}
       

        {/* Carousel Images */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`position-absolute w-100 h-100 transition-opacity ${index === currentImageIndex ? "opacity-100" : "opacity-0"}`}
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
              className={`rounded-circle ${index === currentImageIndex ? "bg-primary" : "bg-white opacity-75"}`}
              style={{ width: "12px", height: "12px", border: "none", cursor: "pointer" }}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="col-12 col-md-5 d-flex flex-column justify-content-center px-4 px-lg-5 bg-white">
      
          <div className="text-center mb-4">
          <img
            src="/images/logo0.png"
            alt="Emergency Department Logo"
            className="img-fluid"
            style={{ maxHeight: "80px" }}
          />
            <h2 className="fw-bold text-dark mb-1">Sign In</h2>
            <p className="text-muted small">Access your Emergency Department account</p>
            
          </div>

          {message && (
            <div className={`alert ${message.includes("réussie") ? "alert-success" : "alert-danger"} py-2 mb-3`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Email Address</label>
              <input
                type="email"
                className="form-control form-control-lg bg-light"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <label className="form-label small fw-medium">Password</label>
                <Link to="/forgotpassword" className="text-decoration-none small" style={{ color: "#6DDCCF" }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                className="form-control form-control-lg bg-light"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="mb-4">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="rememberMe" />
                <label className="form-check-label small" htmlFor="rememberMe">
                  Remember Me
                </label>
              </div>
            </div>
            <div className="mb-3 flex justify-center">
            {recaptchaLoaded ? (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                onErrored={handleRecaptchaError}
                onExpired={handleRecaptchaExpired}
                className="transform scale-90"
              />
            ) : (
              <div className="alert alert-danger">
                Impossible de charger reCAPTCHA. Vérifiez votre connexion ou contactez l'administrateur.
              </div>
            )}
          </div>
            <button
              type="submit"
              className="btn btn-lg w-100 fw-medium"
              style={{
                backgroundColor: "#6DDCCF",
                borderColor: "#6DDCCF",
                color: "white",
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" />
            <span className="mx-3 text-muted small">OR</span>
            <hr className="flex-grow-1" />
          </div>

          <GoogleOAuthProvider clientId="681587327914-bh8qlfn9kr76hci8d4n0v1mces8ac0r0.apps.googleusercontent.com">
            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
              />
            </div>
          </GoogleOAuthProvider>

          <p className="text-center mt-4 mb-0">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#6DDCCF" }}>
              Sign Up
            </Link>
          </p>
        
      </div>
    </div>
  )
}

export default Login
