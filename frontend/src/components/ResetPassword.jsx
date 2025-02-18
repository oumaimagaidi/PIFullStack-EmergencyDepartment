import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState(""); // Changed from "password" to "newPassword"
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { token } = useParams(); // Capture the token from URL

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!newPassword) {
            setError("❌ New Password is required!");
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:8080/api/auth/reset-password/${token}`,
                { newPassword }, // Using the correct payload
                { withCredentials: true }
            );

            if (res.data.success) {
                setMessage("✅ Password successfully updated! Redirecting to login...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError("❌ Something went wrong. Please try again.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "❌ Error resetting password.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center bg-secondary vh-100">
            <div className="bg-white p-4 rounded w-25 shadow">
                <h4 className="text-center">Reset Password</h4>
                {error && <p className="text-danger text-center">{error}</p>}
                {message && <p className="text-success text-center">{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="newPassword">
                            <strong>New Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter new password"
                            autoComplete="off"
                            name="newPassword"
                            className="form-control rounded-0"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-success w-100 rounded-0" disabled={!newPassword}>
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
