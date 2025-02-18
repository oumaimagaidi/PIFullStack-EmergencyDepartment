import React from "react";
import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";

export function FooterComponent() {
  return (
    <footer className="py-5 text-white text-center" style={{ backgroundColor: "#005477" }}>
      <div className="container">
        <div className="d-flex flex-column align-items-center gap-3">
          
          {/* Liens rapides */}
          <div className="d-flex flex-wrap justify-content-center gap-5">
            <div>
              <h6 className="font-weight-bold">About</h6>
              <ul className="list-unstyled">
                <li><a href="/about" className="text-white text-decoration-none">About Us</a></li>
                <li><a href="/mission" className="text-white text-decoration-none">Our Mission</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-weight-bold">Legal</h6>
              <ul className="list-unstyled">
                <li><a href="/privacy-policy" className="text-white text-decoration-none">Privacy Policy</a></li>
                <li><a href="/terms" className="text-white text-decoration-none">Terms & Conditions</a></li>
              </ul>
            </div>
            <div>
            <h6 className="font-weight-bold">Follow Us</h6>
            <div className="d-flex justify-content-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white"><BsFacebook size={24} /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white"><BsInstagram size={24} /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white"><BsTwitter size={24} /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white"><BsGithub size={24} /></a>
              <a href="https://dribbble.com" target="_blank" rel="noopener noreferrer" className="text-white"><BsDribbble size={24} /></a>
            </div>
          </div>

          {/* Réseaux Sociaux */}
          
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
