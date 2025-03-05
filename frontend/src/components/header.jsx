import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { FiUser } from "react-icons/fi";
import Cookies from "js-cookie";
import axios from "axios";
import "./header.css"; // Import the CSS file

const Header = () => {
    const [show, setShow] = useState(false);
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
        return <div>Loading...</div>; // Or a loading component
    }

    return (
        <nav className="header_container">
            <div className="header_logo">
                <img src="./images/logo1.png" alt="logo" className="header_logo-img" />
            </div>
            <div className={show ? "header_navLinks header_showmenu" : "header_navLinks"}>
                <div className="header_links">
                    <Link to={"/home"} onClick={() => setShow(!show)}>Home</Link>
                    <Link to={"/emergency-register"} onClick={() => setShow(!show)}>Emergency</Link>
                    <Link to={"/document"} onClick={() => setShow(!show)}>Medical Document</Link>
                    <Link to={"/ambulance"} onClick={() => setShow(!show)}>Ambulance Check</Link>
                    <Link to={"/ressources"} onClick={() => setShow(!show)}>Resources Check</Link>
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
                                        console.error("Failed to load image:", user.profileImage);
                                        e.target.style.display = "none"; // Hide image if load fails
                                    }}
                                />
                            )}
                            <span>{user.username}</span>
                            <FiUser className="header_user-icon" />
                        </div>

                        {dropdownOpen && (
                            <div className="header_dropdown-menu">
                                <Link to="/profile" onClick={closeDropdown}>My Profile</Link>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button className="header_btn header_loginBtn" onClick={() => navigate("/login")}>Login</button>
                )}
            </div>
           
        </nav>
    );
};

export default Header;