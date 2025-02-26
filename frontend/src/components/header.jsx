import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FiUser } from "react-icons/fi";
import Cookies from "js-cookie";
import axios from "axios";
import "./header.css";

const Header = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const response = await axios.get("http://localhost:8089/api/auth/me", { withCredentials: true });
          setUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8089/api/auth/logout", {}, { withCredentials: true });
      Cookies.remove("token");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.response?.data?.message || error.message);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  if (loading) {
    return <div>Loading...</div>; // Ou un composant de chargement
  }

  return (
    <nav className="container">
      <div className="logo">
        <img src="./images/logo1.png" alt="logo" className="logo-img" />
      </div>
      <div className={`navLinks ${showMenu ? "showmenu" : ""}`}>
        <div className="links">
          <Link to="/" onClick={() => setShowMenu(false)}>Home</Link>
          <Link to="/appointment" onClick={() => setShowMenu(false)}>Emergency</Link>
          <Link to="/document" onClick={() => setShowMenu(false)}>Medical document</Link>
          <Link to="/ambulance" onClick={() => setShowMenu(false)}>Ambulance check</Link>
          <Link to="/ressources" onClick={() => setShowMenu(false)}>Resources check</Link>
        </div>

        {user ? (
          <div className="user-menu">
            <div className="user-info" onClick={toggleDropdown}>
              {user.profileImage && (
                <img
                  src={`http://localhost:8089${user.profileImage}`}
                  alt="Profile"
                  className="user-avatar"
                  onError={(e) => {
                    console.error("Failed to load image:", user.profileImage);
                    e.target.style.display = "none";
                  }}
                />
              )}
              <span>{user.username}</span>
              <FiUser className="user-icon" />
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <Link to="/profile" onClick={closeDropdown}>My Profile</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn loginBtn" onClick={() => navigate("/login")}>Login</button>
        )}
      </div>
      <div className="hamburger" onClick={() => setShowMenu(!showMenu)}>
        <GiHamburgerMenu />
      </div>
    </nav>
  );
};

export default Header;