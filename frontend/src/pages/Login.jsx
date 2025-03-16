import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import ReCAPTCHA from "react-google-recaptcha";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import QRCode from "qrcode.react";

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

// Define the base URL for the backend using environment variable
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8089/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [notBot, setNotBot] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const navigate = useNavigate();
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
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchQrCode = async () => {
    setIsLoading(true);
    try {
      console.log("Attempting to fetch QR code from:", `${BASE_URL}/auth/generate-qr-code`);
      const response = await axios.get(`${BASE_URL}/auth/generate-qr-code`, {
        timeout: 10000,
      });
      console.log("QR code response:", response.data);
      if (response.data && response.data.code) {
        setQrCode(response.data.code);
        setMessage("");
      } else {
        throw new Error("Invalid response format: 'code' field missing");
      }
    } catch (error) {
      console.error("Error fetching QR code:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        network: error.code,
      });
      if (error.code === "ECONNABORTED") {
        setMessage(
          "Erreur lors de la génération du code QR. Délai d'attente dépassé (10s). Vérifiez la connexion au serveur ou contactez l'administrateur."
        );
      } else if (error.response) {
        setMessage(
          `Erreur lors de la génération du code QR. Détails : ${error.response.data?.message || error.message}.`
        );
      } else {
        setMessage(
          "Erreur lors de la génération du code QR. Impossible de se connecter au serveur. Vérifiez votre réseau ou contactez l'administrateur."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowQRCode = async () => {
    setShowQRCode(!showQRCode);
    if (!showQRCode && !qrCode) {
      await fetchQrCode();
    }
  };

  const handleQrCodeSubmit = async (e) => {
    e.preventDefault();
    if (!enteredCode) {
      setMessage("Veuillez entrer le code QR.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/auth/qr-login`, { code: enteredCode });
      const userData = response.data.user;
      const token = response.data.token;

      if (!userData || !userData.role || !userData.username) {
        throw new Error("Données utilisateur incomplètes dans la réponse du serveur.");
      }

      userData.profilePicture = userData.gender === "Male" ? "/images/male.jpg" : "/images/female.jpg";
      sessionStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      setMessage(`Connexion réussie ! Bienvenue, ${userData.username}`);

      navigate("/dashboard");
    } catch (error) {
      console.error("QR login error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setMessage(error.response?.data?.message || "Erreur lors de la connexion via QR code.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notBot) {
      setMessage("Veuillez vérifier que vous n'êtes pas un robot.");
      return;
    }
    setIsLoading(true);
    try {
      const recaptchaToken = recaptchaRef.current.getValue();
      if (!recaptchaToken) {
        setMessage("Veuillez vérifier que vous n'êtes pas un robot.");
        setNotBot(false);
        recaptchaRef.current.reset();
        return;
      }
      console.log("Sending login request with recaptchaToken:", recaptchaToken);
      const response = await axios.post(
        `${BASE_URL}/auth/login`,
        { email, password, recaptchaToken },
        { withCredentials: true }
      );
      console.log("Backend response:", response.data);
      const userData = response.data.user;
      console.log("User data:", userData);

      if (!userData || !userData.role || !userData.username) {
        throw new Error("Données utilisateur incomplètes dans la réponse du serveur.");
      }

      userData.profilePicture = userData.gender === "Male" ? "/images/male.jpg" : "/images/female.jpg";
      sessionStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", response.data.token);
      setMessage(`Connexion réussie ! Bienvenue, ${userData.username}`);

      const destination = userData.role === "Patient" ? "/home" : "/dashboard";
      console.log("Navigating to:", destination);
      navigate(destination);
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
      setNotBot(false);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/google-login`, {
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
      <div className="d-none d-md-flex col-md-6 position-relative overflow-hidden">
        {images.map((image, index) => (
          <div
            key={index}
            className={`position-absolute w-100 h-100 transition-opacity ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ transition: "opacity 1s ease-in-out" }}
          >
            <img src={image.url} alt={image.title} className="w-100 h-100 object-fit-cover" />
            <div className="position-absolute bottom-0 p-4 text-white bg-dark bg-opacity-50 w-100">
              <h3 className="mb-1">{image.title}</h3>
              <p>{image.description}</p>
            </div>
          </div>
        ))}
        <div className="position-absolute bottom-2 start-50 translate-middle-x d-flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`rounded-circle bg-white ${
                index === currentImageIndex ? "opacity-100" : "opacity-50"
              }`}
              style={{ width: "10px", height: "10px", border: "none" }}
              onClick={() => setCurrentImageIndex(index)}
            ></button>
          ))}
        </div>
      </div>

      <div className="col-12 col-md-6 d-flex flex-column justify-content-center p-5 bg-white shadow">
        <h2 className="mb-3 text-2xl font-bold">Sign In</h2>

        {/* Email and Password Login */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
            disabled={isLoading || !notBot}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-3 text-center">Or</div>

        {/* Google Login */}
        <GoogleOAuthProvider clientId="681587327914-bh8qlfn9kr76hci8d4n0v1mces8ac0r0.apps.googleusercontent.com">
          <div className="d-flex justify-content-center mt-3">
            <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginFailure} />
          </div>
        </GoogleOAuthProvider>

        {/* QR Code Login */}
        <div className="mt-3 text-center">Or</div>
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-outline-primary"
            onClick={handleShowQRCode}
            style={{ transition: "all 0.3s ease" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#6DDCCF")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "")}
          >
            {showQRCode ? "Hide QR Code" : "Login with QR Code"}
          </button>
        </div>

        {showQRCode && qrCode && (
          <div
            className="mt-4 text-center animate__animated animate__fadeIn"
            style={{ animationDuration: "0.5s" }}
          >
            <div
              className="card p-3"
              style={{
                maxWidth: "300px",
                margin: "0 auto",
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div className="card-body">
                <h5 className="card-title text-primary mb-3">Scan to Get Code</h5>
                <p className="card-text text-muted mb-4">
                  Scan this QR code to get a unique code, then enter it below to log in.
                </p>
                <div
                  style={{
                    padding: "10px",
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "2px solid #6DDCCF",
                  }}
                >
                  <QRCode
                    value={`${BASE_URL}/auth/qr-code?code=${qrCode}`}
                    size={200}
                    fgColor="#333333"
                    bgColor="#ffffff"
                    level="H"
                    includeMargin={true}
                    className="mx-auto"
                  />
                </div>
                <p className="card-text mt-3 text-secondary" style={{ fontSize: "0.9rem" }}>
                  Note: This QR code expires after 5 minutes for security.
                </p>
              </div>
            </div>

            <form onSubmit={handleQrCodeSubmit} className="mt-4">
              <div className="mb-3">
                <label className="form-label">Enter QR Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  maxLength="6"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn w-100"
                style={{ backgroundColor: "#6DDCCF", borderColor: "#6DDCCF", color: "white" }}
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Submit QR Code"}
              </button>
            </form>
          </div>
        )}

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