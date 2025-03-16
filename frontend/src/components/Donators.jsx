import React, { useState, useEffect } from "react";
import { FaHospital, FaPhone, FaEnvelope, FaClock, FaBirthdayCake, FaTint, FaSyncAlt } from "react-icons/fa";

const Donators = () => {
  const [donators, setDonators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDonators = async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching donators...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }
      console.log("Token being used:", token);

      const response = await fetch("http://localhost:8089/api/users/donators", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      const text = await response.text();
      console.log("Raw response text:", text);

      if (!response.ok) {
        let errorMessage = `Failed to fetch donators with status ${response.status}`;
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log("Parsed error data:", errorData);
        } catch (jsonError) {
          console.error("Failed to parse response as JSON:", text);
          if (response.status === 404) {
            errorMessage = "The requested route (/api/users/donators) was not found on the server. Please ensure the backend has this route defined in server.js.";
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = "Authentication failed. Please log in again.";
          } else {
            errorMessage = text || "Server error: Unexpected response format. The server may not be running or the route is incorrect.";
          }
        }
        throw new Error(errorMessage);
      }

      const responseData = JSON.parse(text);
      console.log("Fetched data structure:", responseData);

      const donatorsData = Array.isArray(responseData)
        ? responseData
        : responseData.donators || responseData.data || [];
      setDonators(donatorsData);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching donators:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Component mounted");
    fetchDonators();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-2xl shadow-lg mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center">
            <FaTint className="mr-3 text-white" /> Donators
          </h1>
          <button
            onClick={fetchDonators}
            className="flex items-center space-x-2 bg-white text-red-600 px-4 py-2 rounded-full shadow hover:bg-gray-100 transition"
            disabled={loading}
          >
            <FaSyncAlt className={`${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-600 border-solid"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow">
            <p>{error}</p>
            {error.includes("token") && (
              <p className="mt-2">
                It looks like you need to log in again.{" "}
                <a href="/login" className="underline text-blue-600">
                  Go to Login
                </a>
              </p>
            )}
            {error.includes("not found") && (
              <p className="mt-2">
                The server route /api/users/donators is missing. Please ensure the backend (`server.js`) includes this route with the appropriate middleware and controller functions.
              </p>
            )}
            {error.includes("Failed to fetch") && (
              <p className="mt-2">
                Failed to connect to the server. Ensure the backend is running on port 8089 and CORS is configured correctly.
              </p>
            )}
          </div>
        )}

        {!loading && !error && donators.length === 0 && (
          <p className="text-center text-gray-600 text-lg font-medium">
            No donators found. Add a new donator to get started!
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donators.map((donator) => (
            <div
              key={donator._id || donator.id}
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:brightness-110 border border-gray-200"
            >
              <div className="relative h-48 w-full">
                <img
                  src={donator.imageUrl ? `http://localhost:8089${donator.imageUrl}` : "https://via.placeholder.com/150"}
                  alt={donator.name || "Donator"}
                  className="w-full h-full object-contain rounded-t-2xl bg-gray-200"
                  onError={(e) => {
                    console.error(`Image load failed for ${donator.imageUrl}`);
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 left-2 text-white">
                  <h2 className="text-xl font-bold">{donator.name || "Unknown"}</h2>
                  <p className="text-sm">{donator.bloodGroup || "N/A"}</p>
                </div>
              </div>

              <div className="p-2 space-y-1 text-gray-700 text-sm">
                <div className="flex items-center space-x-1">
                  <FaBirthdayCake className="text-red-500" />
                  <p className="text-xs">
                    <span className="font-semibold">Age:</span> {donator.age || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <FaBirthdayCake className="text-red-500" />
                  <p className="text-xs">
                    <span className="font-semibold">DOB:</span>{" "}
                    {donator.dateOfBirth || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <FaEnvelope className="text-red-500" />
                  <p className="text-xs truncate">
                    <span className="font-semibold">Email:</span>{" "}
                    {donator.contactInfo || donator.email || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <FaPhone className="text-red-500" />
                  <p className="text-xs">
                    <span className="font-semibold">Phone:</span>{" "}
                    {donator.phoneNumber || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <FaTint className="text-red-500" />
                  <p className="text-xs">
                    <span className="font-semibold">Units:</span>{" "}
                    {donator.units || "0"}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <FaHospital className="text-red-500" />
                  <p className="text-xs">
                    <span className="font-semibold">Hospital:</span>{" "}
                    {donator.hospitalName || "N/A"}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <FaClock className="text-red-500" />
                  <p className="text-xs">
                    <span className="font-semibold">Time:</span>{" "}
                    {donator.requestTime || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Donators;