import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const useDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const doctorsPerPage = 6;
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found in localStorage, redirecting to login");
      setError("No authentication token found. Please log in.");
      setLoading(false);
      navigate("/login");
      return;
    }

    console.log("Fetching doctors with token:", token.substring(0, 20) + "..."); // Debug log
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    console.log("Request headers:", headers); // Debug log

    try {
      const response = await fetch("http://localhost:8089/api/users/doctors", {
        headers,
      });

      console.log("Response status:", response.status); // Debug log
      console.log("Response ok:", response.ok); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response text:", errorText); // Debug log
        if (response.status === 401) {
          throw new Error("Session expired. Please log in again.");
        } else if (response.status === 403) {
          throw new Error("Access denied: Only administrators can view doctors.");
        }
        throw new Error(`HTTP Error ${response.status}: ${errorText || "Network or server error"}`);
      }

      const data = await response.json();
      console.log("Raw response from backend:", data); // Debug log
      const fetchedDoctors = data.doctors || []; // Ensure fallback to empty array if no doctors
      console.log("Processed doctors:", fetchedDoctors); // Debug log
      setDoctors(fetchedDoctors);
      setFilteredDoctors(fetchedDoctors);
      setTotalPages(Math.ceil(fetchedDoctors.length / doctorsPerPage));
    } catch (error) {
      console.error("Error fetching doctors:", error.message); // Debug log
      setError(error.message); // Ensure error is set for display
      if (error.message.includes("Session expired")) {
        console.log("Session expired, removing token and redirecting to login");
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleSearch = useCallback(
    (query) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        setSearchQuery(query);
        setCurrentPage(1);

        if (!query.trim()) {
          setFilteredDoctors(doctors);
          setTotalPages(Math.ceil(doctors.length / doctorsPerPage));
          return;
        }

        const filtered = doctors.filter(
          (doctor) =>
            doctor.username?.toLowerCase().includes(query.toLowerCase()) ||
            doctor.specialization?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredDoctors(filtered);
        setTotalPages(Math.ceil(filtered.length / doctorsPerPage));
      }, 300);
    },
    [doctors]
  );

  const paginatedDoctors = useMemo(() => {
    const startIndex = (currentPage - 1) * doctorsPerPage;
    return filteredDoctors.slice(startIndex, startIndex + doctorsPerPage);
  }, [filteredDoctors, currentPage]);

  return {
    doctors,
    filteredDoctors,
    searchQuery,
    loading,
    error,
    currentPage,
    totalPages,
    paginatedDoctors,
    fetchDoctors,
    handleSearch,
    setCurrentPage,
    setLoading,
  };
};

const DoctorForm = ({
  editingDoctor,
  setEditingDoctor,
  newDoctor,
  setNewDoctor,
  previewImage,
  setPreviewImage,
  formErrors,
  setFormErrors,
  handleSubmit,
  handleImageChange,
  handleSheetClose,
  specializations,
  loading,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div className="relative">
        <Input
          placeholder="Username"
          value={editingDoctor ? editingDoctor.username : newDoctor.username}
          onChange={(e) =>
            editingDoctor
              ? setEditingDoctor({ ...editingDoctor, username: e.target.value })
              : setNewDoctor({ ...newDoctor, username: e.target.value })
          }
          required
          aria-invalid={!!formErrors.username}
          aria-describedby={formErrors.username ? "username-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {formErrors.username && (
          <p id="username-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.username}
          </p>
        )}
      </div>
      <div className="relative">
        <Input
          placeholder="Email"
          type="email"
          value={editingDoctor ? editingDoctor.email : newDoctor.email}
          onChange={(e) =>
            editingDoctor
              ? setEditingDoctor({ ...editingDoctor, email: e.target.value })
              : setNewDoctor({ ...newDoctor, email: e.target.value })
          }
          required
          aria-invalid={!!formErrors.email}
          aria-describedby={formErrors.email ? "email-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {formErrors.email && (
          <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.email}
          </p>
        )}
      </div>
      {!editingDoctor && (
        <div className="relative">
          <Input
            placeholder="Password"
            type="password"
            value={newDoctor.password}
            onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
            required
            aria-invalid={!!formErrors.password}
            aria-describedby={formErrors.password ? "password-error" : undefined}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
          />
          {formErrors.password && (
            <p id="password-error" className="text-red-500 text-sm mt-1" role="alert">
              {formErrors.password}
            </p>
          )}
        </div>
      )}
      <div className="relative">
        <Input
          placeholder="Phone Number"
          value={editingDoctor ? editingDoctor.phoneNumber : newDoctor.phoneNumber}
          onChange={(e) =>
            editingDoctor
              ? setEditingDoctor({ ...editingDoctor, phoneNumber: e.target.value })
              : setNewDoctor({ ...newDoctor, phoneNumber: e.target.value })
          }
          required
          aria-invalid={!!formErrors.phoneNumber}
          aria-describedby={formErrors.phoneNumber ? "phoneNumber-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {formErrors.phoneNumber && (
          <p id="phoneNumber-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.phoneNumber}
          </p>
        )}
      </div>
      <div className="relative">
        <select
          value={editingDoctor ? editingDoctor.specialization : newDoctor.specialization}
          onChange={(e) =>
            editingDoctor
              ? setEditingDoctor({ ...editingDoctor, specialization: e.target.value })
              : setNewDoctor({ ...newDoctor, specialization: e.target.value })
          }
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
          required
          aria-invalid={!!formErrors.specialization}
          aria-describedby={formErrors.specialization ? "specialization-error" : undefined}
        >
          <option value="">Select Specialization</option>
          {specializations.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
        {formErrors.specialization && (
          <p id="specialization-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.specialization}
          </p>
        )}
      </div>
      <div className="relative">
        <Input
          placeholder="License Number"
          value={editingDoctor ? editingDoctor.licenseNumber : newDoctor.licenseNumber}
          onChange={(e) =>
            editingDoctor
              ? setEditingDoctor({ ...editingDoctor, licenseNumber: e.target.value })
              : setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })
          }
          required
          aria-invalid={!!formErrors.licenseNumber}
          aria-describedby={formErrors.licenseNumber ? "licenseNumber-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {formErrors.licenseNumber && (
          <p id="licenseNumber-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.licenseNumber}
          </p>
        )}
      </div>
      <div className="relative">
        <Input
          placeholder="Badge Number"
          value={editingDoctor ? editingDoctor.badgeNumber : newDoctor.badgeNumber}
          onChange={(e) =>
            editingDoctor
              ? setEditingDoctor({ ...editingDoctor, badgeNumber: e.target.value })
              : setNewDoctor({ ...newDoctor, badgeNumber: e.target.value })
          }
          required
          aria-invalid={!!formErrors.badgeNumber}
          aria-describedby={formErrors.badgeNumber ? "badgeNumber-error" : undefined}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {formErrors.badgeNumber && (
          <p id="badgeNumber-error" className="text-red-500 text-sm mt-1" role="alert">
            {formErrors.badgeNumber}
          </p>
        )}
      </div>
      <div className="relative">
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
        />
        {previewImage && (
          <img
            src={previewImage}
            alt="Preview"
            className="mt-4 w-32 h-32 object-cover rounded-full border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 hover:scale-105 mx-auto"
          />
        )}
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all duration-300 shadow-md rounded-lg py-3"
        disabled={loading}
      >
        {loading ? <span className="mr-2 animate-spin">⏳</span> : null}
        {editingDoctor ? "Update Doctor" : "Add Doctor"}
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full mt-3 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-300 rounded-lg py-3"
        onClick={handleSheetClose}
      >
        Cancel
      </Button>
    </form>
  );
};

const DoctorCard = React.memo(({ doctor, onEdit, onDelete, loading }) => {
  return (
    <Card className="relative bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl overflow-hidden border border-gray-200 hover:border-indigo-400">
      <CardContent className="p-6 text-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
          <img
            src={
              doctor.profileImage
                ? `http://localhost:8089${doctor.profileImage.startsWith("/") ? doctor.profileImage : "/" + doctor.profileImage}`
                : "https://via.placeholder.com/150?text=Doctor"
            }
            alt={doctor.username}
            className="w-40 h-40 mx-auto object-cover rounded-full border-4 border-gray-100 group-hover:border-indigo-300 transition-all duration-500 group-hover:scale-110"
          />
          {doctor.specialization && (
            <span className="absolute top-2 left-2 bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full shadow-md border border-indigo-200 group-hover:bg-indigo-100 transition-all duration-300">
              🩺 {doctor.specialization}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-6 truncate">
          {doctor.username || "Name not available"}
        </h2>
        <div className="mt-6 space-y-4 text-gray-600 text-sm">
          {doctor.badgeNumber && (
            <p className="flex items-center justify-center gap-2">
              <span className="text-indigo-500">🔑</span> Badge: {doctor.badgeNumber}
            </p>
          )}
          {doctor.licenseNumber && (
            <p className="flex items-center justify-center gap-2">
              <span className="text-green-500">📜</span> License: {doctor.licenseNumber}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 group relative">
            <span className="text-indigo-400">📧</span>
            <span className="group-hover:text-indigo-600 transition-colors duration-300">
              {doctor.email || "Email not available"}
            </span>
            <div className="absolute bottom-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Send email
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 group relative">
            <span className="text-green-400">📞</span>
            <span className="group-hover:text-green-600 transition-colors duration-300">
              {doctor.phoneNumber || "Number not available"}
            </span>
            <div className="absolute bottom-8 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Call
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-8 gap-4">
          <Button
            variant="outline"
            size="sm"
            className="relative group bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
            onClick={() => onEdit(doctor)}
            disabled={loading}
          >
            ✏️ Edit
            <span className="absolute bottom-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Edit this doctor
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="relative group bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 hover:shadow-lg transition-all duration-300"
            onClick={() => onDelete(doctor._id)}
            disabled={loading}
          >
            🗑️ Delete
            <span className="absolute bottom-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
              Delete this doctor
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center gap-2 mt-8" role="navigation" aria-label="Pagination">
      <Button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all duration-300 rounded-lg px-4 py-2 disabled:opacity-50"
      >
        Previous
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${
            currentPage === page
              ? "bg-indigo-600 text-white"
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          } transition-all duration-300 rounded-lg px-4 py-2`}
        >
          {page}
        </Button>
      ))}
      <Button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-all duration-300 rounded-lg px-4 py-2 disabled:opacity-50"
      >
        Next
      </Button>
    </div>
  );
};

const Doctors = () => {
  const {
    doctors,
    filteredDoctors,
    searchQuery,
    loading,
    error,
    currentPage,
    totalPages,
    paginatedDoctors,
    fetchDoctors,
    handleSearch,
    setCurrentPage,
    setLoading,
  } = useDoctors();

  const [editingDoctor, setEditingDoctor] = useState(null);
  const [newDoctor, setNewDoctor] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    specialization: "",
    licenseNumber: "",
    badgeNumber: "",
    profileImage: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();

  const specializations = [
    "Cardiology",
    "Surgery",
    "Pediatrics",
    "Orthopedics",
    "Neurology",
    "Dermatology",
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchDoctors();
  }, [navigate, fetchDoctors]); // Stable dependency array

  const validateFields = (data, isUpdate = false) => {
    const errors = {};
    const { username, email, password, phoneNumber, specialization, licenseNumber, badgeNumber } = data;

    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email";
    if (!phoneNumber) errors.phoneNumber = "Phone number is required";
    else if (!/^\d{9,}$/.test(phoneNumber))
      errors.phoneNumber = "Invalid phone number (at least 9 digits)";
    if (!specialization) errors.specialization = "Specialization is required";
    if (!licenseNumber) errors.licenseNumber = "License number is required";
    else if (!/^\d+$/.test(licenseNumber))
      errors.licenseNumber = "License number must be numeric";
    if (!badgeNumber) errors.badgeNumber = "Badge number is required";
    else if (!/^\d+$/.test(badgeNumber))
      errors.badgeNumber = "Badge number must be numeric";
    if (!isUpdate && (!password || password.length < 6))
      errors.password = "Password must be at least 6 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validateFields(newDoctor)) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("username", newDoctor.username);
    formData.append("email", newDoctor.email);
    formData.append("password", newDoctor.password);
    formData.append("phoneNumber", newDoctor.phoneNumber);
    formData.append("specialization", newDoctor.specialization);
    formData.append("licenseNumber", newDoctor.licenseNumber);
    formData.append("badgeNumber", newDoctor.badgeNumber);
    if (newDoctor.profileImage) {
      formData.append("profileImage", newDoctor.profileImage);
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8089/api/users/doctors", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorText || "Error adding doctor"}`);
      }

      const data = await response.json();
      setNewDoctor({
        username: "",
        email: "",
        password: "",
        phoneNumber: "",
        specialization: "",
        licenseNumber: "",
        badgeNumber: "",
        profileImage: null,
      });
      setPreviewImage(null);
      setFormErrors({});
      setIsSheetOpen(false);
      alert(data.message || "Doctor added successfully");
      await fetchDoctors();
    } catch (error) {
      console.error("Error adding doctor:", error);
      alert(error.message || "Unknown error adding doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingDoctor || !validateFields(editingDoctor, true)) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("username", editingDoctor.username);
    formData.append("email", editingDoctor.email);
    formData.append("phoneNumber", editingDoctor.phoneNumber);
    formData.append("specialization", editingDoctor.specialization);
    formData.append("licenseNumber", editingDoctor.licenseNumber);
    formData.append("badgeNumber", editingDoctor.badgeNumber);
    if (editingDoctor.profileImage instanceof File) {
      formData.append("profileImage", editingDoctor.profileImage);
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8089/api/users/doctors/${editingDoctor._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorText || "Error updating doctor"}`);
      }

      const data = await response.json();
      setEditingDoctor(null);
      setPreviewImage(null);
      setFormErrors({});
      setIsSheetOpen(false);
      alert(data.message || "Doctor updated successfully");
      await fetchDoctors();
    } catch (error) {
      console.error("Error updating doctor:", error);
      alert(error.message || "Unknown error updating doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`http://localhost:8089/api/users/doctors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorText || "Error deleting doctor"}`);
      }

      const data = await response.json();
      alert(data.message || "Doctor deleted successfully");
      await fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert(error.message || "Unknown error deleting doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);

      if (editingDoctor) {
        setEditingDoctor({ ...editingDoctor, profileImage: file });
      } else {
        setNewDoctor({ ...newDoctor, profileImage: file });
      }
    }
  };

  const handleEditClick = (doctor) => {
    setEditingDoctor({ ...doctor });
    setPreviewImage(doctor.profileImage ? `http://localhost:8089${doctor.profileImage}` : null);
    setFormErrors({});
    setIsSheetOpen(true);
  };

  const handleSheetClose = () => {
    setIsSheetOpen(false);
    setEditingDoctor(null);
    setNewDoctor({
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      specialization: "",
      licenseNumber: "",
      badgeNumber: "",
      profileImage: null,
    });
    setPreviewImage(null);
    setFormErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-white p-8">
      <header className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Doctor Management
        </h1>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="relative group bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all duration-300 shadow-lg rounded-lg py-3 px-6"
              disabled={loading}
              onClick={() => {
                setEditingDoctor(null);
                setPreviewImage(null);
                setNewDoctor({
                  username: "",
                  email: "",
                  password: "",
                  phoneNumber: "",
                  specialization: "",
                  licenseNumber: "",
                  badgeNumber: "",
                  profileImage: null,
                });
                setFormErrors({});
                setIsSheetOpen(true);
              }}
            >
              ➕ Add Doctor
              <span className="absolute bottom-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                Add a new doctor
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-lg shadow-2xl">
            <SheetHeader>
              <SheetTitle className="text-2xl font-semibold text-gray-900">
                {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
              </SheetTitle>
            </SheetHeader>
            <DoctorForm
              editingDoctor={editingDoctor}
              setEditingDoctor={setEditingDoctor}
              newDoctor={newDoctor}
              setNewDoctor={setNewDoctor}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              formErrors={formErrors}
              setFormErrors={setFormErrors}
              handleSubmit={editingDoctor ? handleUpdate : handleAdd}
              handleImageChange={handleImageChange}
              handleSheetClose={handleSheetClose}
              specializations={specializations}
              loading={loading}
            />
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex gap-4 mb-10">
        <div className="relative flex-1">
          <span className="absolute left-1 top-3 text-gray-480">🔍</span>
          <Input
            placeholder="Search doctors..."
            className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition-all duration-300 shadow-sm"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={loading}
            aria-label="Search doctors"
          />
        </div>
      </div>

      {loading && doctors.length === 0 ? (
        <div className="flex justify-center">
          <span className="text-indigo-600 text-2xl animate-pulse">⏳ Loading...</span>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button
            onClick={fetchDoctors}
            className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-300 rounded-lg px-6 py-2"
          >
            Retry
          </Button>
        </div>
      ) : paginatedDoctors.length === 0 ? (
        <p className="text-center text-gray-500 text-lg" role="alert">
          No doctors found.
        </p>
      ) : (
        <>
          <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {paginatedDoctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                onEdit={handleEditClick}
                onDelete={handleDelete}
                loading={loading}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </div>
  );
};

export default Doctors;