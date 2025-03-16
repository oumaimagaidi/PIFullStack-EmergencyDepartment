import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DonatorForm = ({ onClose, fetchDonators }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bloodGroup: "",
    dateOfBirth: "",
    contactInfo: "",
    phoneNumber: "",
    units: "",
    hospitalName: "",
    requestTime: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError("No image selected. Please choose a file.");
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Image size too large. Maximum size is 50MB.");
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      setError("Invalid file type. Please upload a JPEG, JPG, or PNG image.");
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      setError("Invalid image file. Please upload a valid image.");
      setImageFile(null);
      setImagePreview(null);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSubmit = async (e, attempt = 0) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (Object.values(formData).some((value) => !value.trim())) {
      setError("All text fields are required.");
      setLoading(false);
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError("Age must be a valid number between 1 and 120.");
      setLoading(false);
      return;
    }
    const unitsNum = parseInt(formData.units, 10);
    if (isNaN(unitsNum) || unitsNum < 1) {
      setError("Units donated must be a positive number.");
      setLoading(false);
      return;
    }

    if (!/^\+\d{10,15}$/.test(formData.phoneNumber)) {
      setError("Phone number must start with '+' followed by 10-15 digits (e.g., +12345678901).");
      setLoading(false);
      return;
    }

    if (!imageFile) {
      setError("An image is required. Please upload a valid image.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const data = new FormData();
      data.append("name", formData.name);
      data.append("age", ageNum);
      data.append("bloodGroup", formData.bloodGroup);
      data.append("dateOfBirth", formData.dateOfBirth);
      data.append("contactInfo", formData.contactInfo);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("units", unitsNum);
      data.append("hospitalName", formData.hospitalName);
      data.append("requestTime", formData.requestTime);
      data.append("image", imageFile);

      console.log("Submitting FormData with contents:", {
        name: formData.name,
        age: ageNum,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        contactInfo: formData.contactInfo,
        phoneNumber: formData.phoneNumber,
        units: unitsNum,
        hospitalName: formData.hospitalName,
        requestTime: formData.requestTime,
        imageName: imageFile.name,
        imageSize: imageFile.size,
        imageType: imageFile.type,
      });

      const response = await fetch("http://localhost:8089/api/users/donators", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const responseText = await response.text();
      console.log("Response status:", response.status);
      console.log("Response text:", responseText);

      if (!response.ok) {
        let errorMessage = `Submission failed with status ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || "Unknown server error";
        } catch {
          errorMessage += `: ${responseText || "No additional details provided"}`;
        }

        if (attempt < maxRetries && errorMessage.toLowerCase().includes("image")) {
          console.log(`Retrying (${attempt + 1}/${maxRetries}) due to image-related error...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          return handleSubmit(e, attempt + 1);
        }
        throw new Error(errorMessage);
      }

      const responseData = responseText ? JSON.parse(responseText) : {};
      setSuccess(responseData.message || "Donator added successfully!");
      setFormData({
        name: "",
        age: "",
        bloodGroup: "",
        dateOfBirth: "",
        contactInfo: "",
        phoneNumber: "",
        units: "",
        hospitalName: "",
        requestTime: "",
      });
      setImageFile(null);
      setImagePreview(null);
      fetchDonators();
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      console.error("Submission error:", error);
      setError(
        error.message.includes("Failed to fetch")
          ? "Cannot connect to server. Check if it's running on port 8089."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-red-600 text-center">
            Add New Donator
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(error || success) && (
            <div
              className={`p-4 rounded-lg ${
                error ? "bg-red-50 border-red-500" : "bg-green-50 border-green-500"
              } border-l-4`}
            >
              <p className={error ? "text-red-700" : "text-green-700"}>{error || success}</p>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-red-600 border-solid"></div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Input
                placeholder="Age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                disabled={loading}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
                disabled={loading}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                required
                disabled={loading}
                className="w-full p-2 border border-gray-300 rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              >
                <option value="">Select Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Email"
                type="email"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                required
                disabled={loading}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Input
                placeholder="Phone Number (e.g., +12345678901)"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
                disabled={loading}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Input
                placeholder="Units Donated"
                type="number"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                required
                disabled={loading}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Input
                placeholder="Hospital Name"
                value={formData.hospitalName}
                onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                required
                disabled={loading}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
              <Input
                type="time"
                value={formData.requestTime}
                onChange={(e) => setFormData({ ...formData, requestTime: e.target.value })}
                required
                disabled={loading}
                className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Document
                </label>
                <Input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  required
                  disabled={loading}
                  className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-full border border-gray-200"
                />
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonatorForm;