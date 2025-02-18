import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(""); // Message de succès ou d'erreur
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(""); // Réinitialiser le message avant chaque requête

        try {
            const res = await axios.post("http://localhost:8080/api/auth/forgot-password", { email }, { withCredentials: true });
            
            if (res.data.message) {
                setMessage("✅ Email de réinitialisation envoyé !");
                setTimeout(() => navigate("/login"), 3000);
            }
        } catch (err) {
            console.error("❌ Erreur Axios :", err);
            setMessage("❌ Erreur lors de la réinitialisation.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="bg-white p-3 rounded w-25" >
                <h4>Mot de passe oublié</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email">
                            <strong>Email</strong>
                        </label>
                        <input
                            type="email"
                            placeholder="Entrez votre email"
                            autoComplete="off"
                            name="email"
                            className="form-control rounded-0"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-0" style={{ backgroundColor: "#6DDCCF", borderColor: "#6DDCCF", color: "white" }}>
                        Envoyer
                    </button>
                </form>
                {message && <p className="mt-3 text-center">{message}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;
