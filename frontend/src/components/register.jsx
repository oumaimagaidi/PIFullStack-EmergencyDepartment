import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";

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
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Vérifier si les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }
    

    try {
      // Envoyer les données d'inscription au backend
      const response = await axios.post(
        "http://localhost:8089/api/auth/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Inclure les cookies
        }
      );

      // Si l'inscription réussit, afficher un message et activer l'OTP
      setMessage("Inscription réussie ! Veuillez vérifier votre email pour l'OTP.");
      setOtpSent(true);
    } catch (error) {
      // Gérer les erreurs
      console.error("Erreur lors de l'inscription:", error);
      setMessage(
        error.response?.data?.message || "Erreur lors de l'inscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      // Vérifier l'OTP
      await axios.post(
        "http://localhost:8089/api/auth/verify-otp",
        {
          email: formData.email,
          otp,
        },
        {
          withCredentials: true, // Inclure les cookies
        }
      );

      // Si l'OTP est vérifié, rediriger vers la page de connexion
      setMessage("OTP vérifié avec succès. Vous pouvez maintenant vous connecter.");
      navigate("/login");
    } catch (error) {
      // Gérer les erreurs de vérification de l'OTP
      setMessage(
        error.response?.data?.message || "Erreur lors de la vérification de l'OTP"
      );
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Left Side */}
      <div
        className="col-md-6 d-flex flex-column align-items-center justify-content-center text-white"
        style={{ backgroundColor: "#6DDCCF" }}
      >
        <h1 className="mb-4">ED</h1>
        <img
          src="/images/image1.png"
          alt="Project Logo"
          className="mb-4 rounded shadow-lg img-fluid"
          style={{ maxWidth: "300px" }}
        />
        <h2 className="mb-2">Emergency department</h2>
        <p className="text-center">
          Providing healthcare to different patient categories
        </p>
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button className="btn btn-outline-secondary rounded-circle">
            <i className="fab fa-facebook"></i>
          </button>
          <button className="btn btn-outline-secondary rounded-circle">
            <i className="fab fa-twitter"></i>
          </button>
          <button className="btn btn-outline-secondary rounded-circle">
            <i className="fab fa-instagram"></i>
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className="col-md-6 d-flex flex-column justify-content-center p-5 bg-white shadow">
        <h2 className="mb-3">Sign Up</h2>
        <p className="text-muted">
          Create your account by filling out the information below.
        </p>

        {!otpSent ? (
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <input
                  type="text"
                  name="username"
                  placeholder="Nom d'utilisateur"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Mot de passe"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmer mot de passe"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Téléphone"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                />
                <select
                  name="role"
                  className="form-control mb-2"
                  onChange={handleChange}
                  required
                >
                  <option value="Patient">Patient</option>
                  <option value="Doctor">Médecin</option>
                  <option value="Nurse">Infirmier</option>
                  <option value="Administrator">Administrateur</option>
                </select>
              </div>
              <div className="col-md-6">
                {formData.role === "Patient" && (
                  <>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nom complet"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="date"
                      name="dateOfBirth"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="gender"
                      placeholder="Genre"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Adresse"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="emergencyContact"
                      placeholder="Contact d'urgence"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="bloodType"
                      placeholder="Groupe sanguin"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="allergies"
                      placeholder="Allergies (optionnel)"
                      className="form-control mb-2"
                      onChange={handleChange}
                    />
                  </>
                )}
                {formData.role === "Doctor" && (
                  <>
                    <input
                      type="text"
                      name="badgeNumber"
                      placeholder="Numéro de badge"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="specialization"
                      placeholder="Spécialisation"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="Numéro de licence"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                  </>
                )}
                {formData.role === "Nurse" && (
                  <>
                    <input
                      type="text"
                      name="badgeNumber"
                      placeholder="Numéro de badge"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="shift"
                      placeholder="Horaire de travail"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder="Numéro de licence"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                  </>
                )}
                {formData.role === "Administrator" && (
                  <>
                    <input
                      type="text"
                      name="badgeNumber"
                      placeholder="Numéro de badge"
                      className="form-control mb-2"
                      onChange={handleChange}
                      required
                    />
                  </>
                )}
              </div>
            </div>
{/* Ajouter le champ pour l'upload d'image */}
<div className="form-group">
              <label htmlFor="profileImage">Image de profil</label>
              <input
                type="file"
                name="profileImage"
                id="profileImage"
                className="form-control mb-2"
                onChange={handleFileChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              style={{
                backgroundColor: "#6DDCCF",
                borderColor: "#6DDCCF",
                color: "white",
              }}
              disabled={isLoading}
            >
              {isLoading ? "Inscription..." : "S'inscrire"}
            </button>

            <div className="mt-3 text-center">
              <span>Déjà un compte ? </span>
              <Link to="/login" className="text-decoration-none">
                Se connecter
              </Link>
            </div>
          </form>
        ) : (
          <div>
            <input
              type="text"
              placeholder="Entrez l'OTP"
              className="form-control mb-2"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              className="btn btn-primary w-100"
              style={{
                backgroundColor: "#6DDCCF",
                borderColor: "#6DDCCF",
                color: "white",
              }}
              onClick={handleVerifyOtp}
            >
              Vérifier l'OTP
            </button>
          </div>
        )}

        {message && (
          <div
            className={`alert ${
              message.includes("réussie") ? "alert-success" : "alert-danger"
            } mt-3`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;