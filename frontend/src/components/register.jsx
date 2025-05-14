"use client"

import ReCAPTCHA from "react-google-recaptcha"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google"
import { motion, AnimatePresence } from "framer-motion"

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
  })

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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

  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [notBot, setNotBot] = useState(false)
  const navigate = useNavigate()
  const canvasRef = useRef(null)
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
    if (!siteKey) {
      console.error("reCAPTCHA site key is not defined in .env file")
      setMessage("reCAPTCHA configuration error. Please contact the administrator.")
      setRecaptchaLoaded(false)
    } else {
      setRecaptchaLoaded(true)
    }

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [images.length])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] })
  }

  const handleRecaptchaChange = (token) => {
    if (token) {
      setNotBot(true)
      setMessage("")
    } else {
      setNotBot(false)
      setMessage("reCAPTCHA verification expired. Please try again.")
      if (recaptchaRef.current) {
        recaptchaRef.current.reset()
      }
    }
  }

  const handleRecaptchaError = () => {
    setNotBot(false)
    setMessage("Error loading reCAPTCHA. Check your connection or contact the administrator.")
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  const handleRecaptchaExpired = () => {
    setNotBot(false)
    setMessage("reCAPTCHA verification expired. Please try again.")
    if (recaptchaRef.current) {
      recaptchaRef.current.reset()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!notBot) {
      setMessage("Please complete the reCAPTCHA verification")
      return
    }

    setIsLoading(true)

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      for (const key in formData) {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key])
        }
      }

      // Send registration data to backend
      const response = await axios.post("http://localhost:8089/api/auth/register", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })

      setMessage("Registration successful! Please check your email for the OTP.")
      setOtpSent(true)
    } catch (error) {
      console.error("Error during registration:", error)
      setMessage(error.response?.data?.message || "Error during registration")
    } finally {
      setIsLoading(false)
    }
  }

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
        },
      )

      setMessage("OTP verified successfully. You can now log in.")
      navigate("/login")
    } catch (error) {
      setMessage(error.response?.data?.message || "Error verifying OTP")
    }
  }

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const res = await axios.post("http://localhost:8089/api/auth/google-login", {
        token: response.credential,
      })
      localStorage.setItem("user", JSON.stringify(res.data.user))
      localStorage.setItem("token", res.data.token)
      setMessage("Registration successful with Google!")
      navigate("/home")
    } catch (error) {
      setMessage("Error during Google authentication")
    }
  }

  const handleGoogleLoginFailure = () => {
    setMessage("Google authentication failed")
  }

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  // Render form fields based on role
  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case "Patient":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Gender</label>
              <select
                name="gender"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              >
               <option value="">Select gender</option>
  <option value="Male">Male</option>
  <option value="Female">Female</option>
  <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Address</label>
              <input
                type="text"
                name="address"
                placeholder="Enter your address"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Emergency Contact</label>
              <input
                type="text"
                name="emergencyContact"
                placeholder="Emergency contact number"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Blood Type</label>
              <select
                name="bloodType"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#213448] mb-1">Allergies (optional)</label>
              <textarea
                name="allergies"
                placeholder="List any allergies you have"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        )
      case "Doctor":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Badge Number</label>
              <input
                type="text"
                name="badgeNumber"
                placeholder="Enter your badge number"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Specialization</label>
              <input
                type="text"
                name="specialization"
                placeholder="Enter your specialization"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#213448] mb-1">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                placeholder="Enter your license number"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )
      case "Nurse":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Badge Number</label>
              <input
                type="text"
                name="badgeNumber"
                placeholder="Enter your badge number"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Shift</label>
              <select
                name="shift"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              >
                <option value="">Select shift</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Night">Night</option>
                <option value="Rotating">Rotating</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#213448] mb-1">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                placeholder="Enter your license number"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )
      case "Administrator":
        return (
          <div>
            <label className="block text-sm font-medium text-[#213448] mb-1">Badge Number</label>
            <input
              type="text"
              name="badgeNumber"
              placeholder="Enter your badge number"
              className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
              onChange={handleChange}
              required
            />
          </div>
        )
      default:
        return null
    }
  }

  // Render form steps
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-[#213448] mb-4">Account Information</h3>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Enter your phone number"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#213448] mb-1">Role</label>
              <select
                name="role"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="Patient">Patient</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={nextStep}
                className="w-full py-2.5 px-4 rounded-md font-medium bg-[#547792] hover:bg-[#213448] text-[#ECEFCA] transition-all duration-300"
              >
                Next Step
              </button>
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-[#213448] mb-4">
              {formData.role === "Patient" ? "Personal Information" : "Professional Information"}
            </h3>
            {renderRoleSpecificFields()}
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="py-2.5 px-4 rounded-md font-medium bg-[#94B4C1]/20 hover:bg-[#94B4C1]/40 text-[#213448] transition-all duration-300"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="py-2.5 px-4 rounded-md font-medium bg-[#547792] hover:bg-[#213448] text-[#ECEFCA] transition-all duration-300"
              >
                Next Step
              </button>
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-[#213448] mb-4">Profile Image</h3>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#213448] mb-1">Upload Profile Image (optional)</label>
              <input
                type="file"
                name="profileImage"
                id="profileImage"
                className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#94B4C1]/20 file:text-[#213448] hover:file:bg-[#94B4C1]/30"
                onChange={handleFileChange}
              />
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
            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="py-2.5 px-4 rounded-md font-medium bg-[#94B4C1]/20 hover:bg-[#94B4C1]/40 text-[#213448] transition-all duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                className={`py-2.5 px-4 rounded-md font-medium transition-all duration-300 ${
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
                    Registering...
                  </div>
                ) : (
                  "Complete Registration"
                )}
              </button>
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }

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
            className="w-full max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-xl"
          >
          <div className="flex items-center justify-center mb-4">
  <img 
    src="/images/logo0.png" 
    alt="Emergency Department Logo" 
    className="h-8 mr-3" // Ajustez la hauteur (h-8) et la marge à droite (mr-3) selon vos besoins
  />
  <div>
    <h2 className="text-2xl font-bold text-[#213448] mb-1">Create Your Account</h2>
    <p className="text-[#547792] text-sm">Join our healthcare platform to access our services</p>
  </div>
</div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 mb-4 rounded-md text-sm ${
                  message.includes("successful")
                    ? "bg-[#94B4C1]/20 text-[#213448] border border-[#94B4C1]/30"
                    : "bg-[#DDA853]/20 text-[#213448] border border-[#DDA853]/30"
                }`}
              >
                {message}
              </motion.div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">{renderFormStep()}</AnimatePresence>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <h3 className="text-lg font-semibold text-[#213448] mb-4">Verify Your Email</h3>
                <p className="text-[#547792] text-sm mb-4">
                  We've sent a verification code to your email. Please enter it below to complete your registration.
                </p>
                <div>
                  <label className="block text-sm font-medium text-[#213448] mb-1">OTP Code</label>
                  <input
                    type="text"
                    placeholder="Enter the OTP code"
                    className="w-full px-4 py-2 rounded-md border border-[#94B4C1]/30 focus:outline-none focus:ring-2 focus:ring-[#547792] bg-white/50"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleVerifyOtp}
                  className="w-full py-2.5 px-4 rounded-md font-medium bg-[#547792] hover:bg-[#213448] text-[#ECEFCA] transition-all duration-300"
                >
                  Verify OTP
                </button>
              </motion.div>
            )}

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
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-[#547792] hover:text-[#213448] transition-colors">
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register