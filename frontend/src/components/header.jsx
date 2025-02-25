import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FiUser } from "react-icons/fi";
import Cookies from "js-cookie";
import axios from "axios";


const Header = () => {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for the token in the cookies
    const token = Cookies.get("token");
    console.log(token);
    if (token) {
      // If there's a token, make an API call to /api/auth/me to verify and get the user info
      axios.get("http://localhost:8089/api/auth/me", { withCredentials: true })
        .then(response => {
          // Set the user state if the response is successful
          setUser(response.data);
          console.log(response.data);
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          setUser(null); // Reset if the token is invalid or expired
        });
    }
  }, []);
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8089/api/auth/logout", {}, { withCredentials: true });
      // Clear local storage
      Cookies.remove("token");
      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.response?.data?.message || error.message);
    }
  };

  return (
    <nav className={"container"}>
      <div className="logo">
        <img src="./images/logo1.png" alt="logo" className="logo-img" />
      </div>
      <div className={show ? "navLinks showmenu" : "navLinks"}>
        <div className="links">
          <Link to={"/"} onClick={() => setShow(!show)}>Home</Link>
          <Link to={"/appointment"} onClick={() => setShow(!show)}>Emergency</Link>
          <Link to={"/document"} onClick={() => setShow(!show)}>Medical document</Link>
          <Link to={"/ambulance"} onClick={() => setShow(!show)}>Ambulance check</Link>
          <Link to={"/ressources"} onClick={() => setShow(!show)}>Resources check</Link>
        </div>

        {user ? (
  <div className="user-menu">
    <div className="user-info" onClick={() => setDropdownOpen(!dropdownOpen)}>
      {user.profileImage && (
        <img
          src={`http://localhost:8089${user.profileImage}`} 
          alt="Profile"
          className="user-avatar"
          onError={(e) => {
            console.error("Failed to load image:", user.profileImage);
            e.target.style.display = "none"; // Masquer l'image si elle ne charge pas
          }}
        />
      )}
      <span>{user.username}</span>
      <FiUser className="user-icon" /> {/* Ajout de l'icône */}
    </div>

    {dropdownOpen && (
      <div className="dropdown-menu">
        <Link to="/profile" onClick={() => navigate('/profile')}>My Profile</Link>
        <button onClick={handleLogout}>Logout</button>
      </div>
    )}
  </div>
) : (
  <button className="btn loginBtn" onClick={() => navigate("/login")}>Login</button>
)}
      </div>
      <div className="hamburger" onClick={() => setShow(!show)}>
        <GiHamburgerMenu />
      </div>
    </nav>
  );
};

export default Header;