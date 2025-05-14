"use client"

import ReCAPTCHA from "react-google-recaptcha"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { motion } from "framer-motion"

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
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [notBot, setNotBot] = useState(false)
  const canvasRef = useRef(null)

  const navigate = useNavigate()
  const recaptchaRef = useRef(null)

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = []
    const particleCount = 50

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 5 + 1
        this.speedX = Math.random() * 1 - 0.5
        this.speedY = Math.random() * 1 - 0.5
        this.color = Math.random() > 0.5 ? "rgba(148, 180, 193, 0.5)" : "rgba(221, 168, 83, 0.3)"
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width || this.x < 0) this.speedX *= -1
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Image carousel and reCAPTCHA setup
  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY
    console.log("reCAPTCHA site key:", siteKey)
    if (!siteKey) {
      console.error("reCAPTCHA site key is not defined in .env file")
      setMessage("Erreur de configuration reCAPTCHA. Veuillez contacter l'administrateur.")
      setRecaptchaLoaded(false)
    } else {
      setRecaptchaLoaded(true)
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!notBot) {
      setMessage("Please complete the reCAPTCHA verification")
      return
    }

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
    console.log("reCAPTCHA token received:", token)
    if (token) {
      setNotBot(true)
      setMessage("")
    } else {
      setNotBot(false)
      setMessage("Vérification reCAPTCHA expirée. Veuillez réessayer.")
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }
    }
  }

  const handleRecaptchaError = () => {
    console.error("reCAPTCHA error occurred")
    setNotBot(false)
    setMessage("Erreur de chargement de reCAPTCHA. Vérifiez votre connexion ou contactez l'administrateur.")
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  const handleRecaptchaExpired = () => {
    console.log("reCAPTCHA expired")
    setNotBot(false)
    setMessage("Vérification reCAPTCHA expirée. Veuillez réessayer.")
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  const handleGoogleLoginFailure = () => setMessage("Échec de l'authentification Google")

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Particle animation canvas */}
      <canvas ref={canvasRef} className="particles-canvas absolute inset-0 z-0" />

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FEE2C5] to-[#C4DDFF] z-0 opacity-80" />

      <div className="flex w-full h-screen z-10 relative">
        {/* Left Side - Logo and Carousel */}
        <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
          {/* Carousel Images */}
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{
                opacity: index === currentImageIndex ? 1 : 0,
                scale: index === currentImageIndex ? 1 : 0.95,
              }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                <img src={image.url || "/placeholder.svg"} alt={image.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#213448]/80 text-[#ECEFCA]">
                  <h3 className="text-xl font-bold mb-1">{image.title}</h3>
                  <p className="text-sm">{image.description}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentImageIndex ? "bg-[#DDA853] w-6" : "bg-[#ECEFCA]/70"
                }`}
                onClick={() => setCurrentImageIndex(index)}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-xl"
          >
            <div className="text-center mb-6">
              <img src="/images/logo0.png" alt="Emergency Department Logo" className="h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#213448] mb-1">Welcome Back</h2>
              <p className="text-[#547792] text-sm">Sign in to access your account</p>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 mb-4 rounded-md text-sm ${
                  message.includes("réussie")
                    ? "bg-[#94B4C1]/20 text-[#213448] border border-[#94B4C1]/30"
                    : "bg-[#DDA853]/20 text-[#213448] border border-[#DDA853]/30"
                }`}
              >
                {message}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#213448] mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-[#213448]">Password</label>
                  <Link to="/forgotpassword" className="text-xs text-[#547792] hover:text-[#213448] transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="w-4 h-4 text-[#547792] border-[#94B4C1] rounded focus:ring-[#547792]"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-[#547792]">
                  Remember me
                </label>
              </div>

              <div className="flex justify-center">
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
                  <div className="p-3 bg-[#DDA853]/20 text-[#213448] border border-[#DDA853]/30 rounded-md text-sm">
                    Unable to load reCAPTCHA. Please check your connection or contact the administrator.
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 px-4 rounded-md font-medium transition-all duration-300 ${
                  isLoading
                    ? "bg-[#94B4C1]/70 text-[#213448]/70 cursor-not-allowed"
                    : "bg-[#547792] hover:bg-[#213448] text-[#ECEFCA]"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#ECEFCA]"
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
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-[#94B4C1]/30"></div>
              <span className="px-4 text-sm text-[#547792]">OR</span>
              <div className="flex-1 h-px bg-[#94B4C1]/30"></div>
            </div>

            <GoogleOAuthProvider clientId="681587327914-bh8qlfn9kr76hci8d4n0v1mces8ac0r0.apps.googleusercontent.com">
              <div className="flex justify-center">
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

            <p className="text-center mt-6 text-sm text-[#547792]">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-[#547792] hover:text-[#213448] transition-colors">
                Sign Up
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login
