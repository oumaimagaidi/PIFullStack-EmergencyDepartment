import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import "animate.css";

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top header-bg">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold animate__animated animate__fadeIn">
          <span className="word1">Emergency</span>
          <span className="word2">Department</span>
          <span className="word3">Management</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link text-light " to="/emergency">
                Emergency
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light animate__animated animate__fadeIn" to="/resources">
                Resources
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light animate__animated animate__fadeIn" to="/patients">
                Patients
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-light animate__animated animate__fadeIn" to="/documents">
                Electronic Documents
              </Link>
            </li>

            {user ? (
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle text-light d-flex align-items-center animate__animated animate__fadeIn"
                  to="#"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {user.username}
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        Mon Profil
                      </Link>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Déconnexion
                      </button>
                    </li>
                  </ul>
                </Link>
              </li>
            ) : (
              <li className="nav-item">
                <Link className="nav-link text-dark animate__animated animate__fadeIn" to="/login">
                  Se connecter
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
