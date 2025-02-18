import React from "react";
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";

export function FooterComponent() {
  return (
    <footer className="py-5 text-white"style={{ backgroundColor: "#6DDCCF" }}>
      <div className="container">
        <div className="row">
          {/* Logo et Brand */}
          <div className="col-12 col-md-4 mb-4 mb-md-0 text-center text-md-left">
            <a href="/" className="d-flex align-items-center justify-content-center justify-content-md-start text-white text-decoration-none">
              <img src="/images/logo0.png" alt="Logo" style={{ height: "50px", marginRight: "10px" }} />
              <span className="h5 font-weight-bold">Emergency Departments</span>
            </a>
          </div>

          {/* Liens rapides */}
          <div className="col-12 col-md-4 mb-4 mb-md-0 text-center">
            <div className="row">
              <div className="col">
                <h6 className="font-weight-bold">About</h6>
                <ul className="list-unstyled">
                  <li><a href="/about" className="text-white text-decoration-none">About Us</a></li>
                  <li><a href="/mission" className="text-white text-decoration-none">Our Mission</a></li>
                </ul>
              </div>
              <div className="col">
                <h6 className="font-weight-bold">Legal</h6>
                <ul className="list-unstyled">
                  <li><a href="/privacy-policy" className="text-white text-decoration-none">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-white text-decoration-none">Terms & Conditions</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Réseaux Sociaux */}
          <div className="col-12 col-md-4 text-center text-md-right">
            <h6 className="font-weight-bold mb-10 mx-10">Follow Us</h6>
            <div className="d-flex justify-content-center justify-content-md-end">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white mx-2"><BsFacebook size={24} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white mx-2"><BsInstagram size={24} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white mx-2"><BsTwitter size={24} /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white mx-2"><BsGithub size={24} /></a>
              <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="text-white mx-2"><BsDribbble size={24} /></a>
            </div>
          </div>
        </div>

        {/* Bas du footer */}
        <div className="text-center pt-4 mt-4 border-top">
          <span>&copy; 2025 Emergency Departments™. All Rights Reserved.</span>
        </div>
      </div>
    </footer>
  );
}
