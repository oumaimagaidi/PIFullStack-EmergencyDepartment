"use client"
import "./header.css"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { GiHamburgerMenu } from "react-icons/gi"
import { FiUser } from "react-icons/fi"
import { MdLocalHospital, MdEmergency } from "react-icons/md"
import { FaAmbulance, FaFileMedical } from "react-icons/fa"
import Cookies from "js-cookie"
import axios from "axios"
import "./header.css"
const Header = () => {
  const [show, setShow] = useState(false)
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("token")
      if (token) {
        try {
          const response = await axios.get("http://localhost:8089/api/auth/me", { withCredentials: true })
          setUser(response.data)
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8089/api/auth/logout", {}, { withCredentials: true })
      Cookies.remove("token")
      setUser(null)
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error.response?.data?.message || error.message)
    }
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const closeDropdown = () => {
    setDropdownOpen(false)
  }

  if (loading) {
    return <div className="loading-spinner">Loading...</div>
  }

  return (
    <nav className="header_container">
            

      <div className="header_logo flex items-center gap-2">
  <img 
    src="./images/logo1.png" 
    alt="Emergency Medical Services" 
    className="header_logo-img w-10 h-10"
  />
  <div className="flex flex-col">
    <span className="font-bold text-blue-900 text-lg tracking-tight">
      EMERGENCY MANAGEMENT
    </span>
    <span className="text-xs text-blue-600 font-medium uppercase tracking-wider">
      Healthcare System
    </span>
  </div>
</div>

      <div className={show ? "header_navLinks header_showmenu" : "header_navLinks"}>
        <div className="header_links">
          <Link to={"/home"} onClick={() => setShow(!show)}>
            <MdLocalHospital className="nav-icon" />
            <span>Home</span>
          </Link>
          <Link to={"/emergency-register"} onClick={() => setShow(!show)} className="emergency-link">
            <MdEmergency className="nav-icon" />
            <span>Emergency</span>
          </Link>
          <Link to={"/document"} onClick={() => setShow(!show)}>
            <FaFileMedical className="nav-icon" />
            <span>Medical Document</span>
          </Link>
          <Link to={"/ambulance_check"} onClick={() => setShow(!show)}>
            <FaAmbulance className="nav-icon" />
            <span>Ambulance Check</span>
          </Link>
       
        </div>

        {user ? (
          <div className="header_user-menu">
            <div className="header_user-info" onClick={toggleDropdown}>
              {user.profileImage && (
                <img
                  src={`http://localhost:8089${user.profileImage}`}
                  alt="Profile"
                  className="header_user-avatar"
                  onError={(e) => {
                    console.error("Failed to load image:", user.profileImage)
                    e.target.style.display = "none"
                  }}
                />
              )}
              <span>{user.username}</span>
              <FiUser className="header_user-icon" />
            </div>

            {dropdownOpen && (
              <div className="header_dropdown-menu">
                <Link to="/profile" onClick={closeDropdown}>
                  My Profile
                </Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <button className="header_btn header_loginBtn" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>

      <div className="header_hamburger" onClick={() => setShow(!show)}>
        <GiHamburgerMenu />
      </div>
    </nav>
  )
}

export default Header
