// src/pages/ConfirmationEmergencyRegister.jsx
"use client"

import { useState, useEffect } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock, Stethoscope } from "lucide-react"
import axios from "axios"
import ParticlesComponent from "@/components/ParticlesComponent" // Import ParticlesComponent

// Updated color palette
const colors = {
  primary: "#213448", // Dark blue
  secondary: "#547792", // Medium blue
  alert: "#dc2626", // Red
  primaryLight: "#94B4C1", // Light blue
  secondaryLight: "#ECEFCA", // Light cream/beige
  alertLight: "#fee2e2",
  bgAccent: "#ECEFCA", // Light cream/beige for background
}

const ConfirmationEmergencyRegister = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const formData = location.state?.formData
  const patientId = location.state?.patientId
  const patientCode = location.state?.patientCode
  const initialAssignedDoctor = location.state?.assignedDoctor

  const [estimatedWaitTime, setEstimatedWaitTime] = useState("Calculating...")
  const [doctorInfo, setDoctorInfo] = useState(null)
  const [loadingWaitTime, setLoadingWaitTime] = useState(true)
  const [errorWaitTime, setErrorWaitTime] = useState(null)
  const [loadingDoctor, setLoadingDoctor] = useState(false)

  useEffect(() => {
    const fetchWaitTime = async () => {
      if (!patientId) return
      setLoadingWaitTime(true)
      setErrorWaitTime(null)
      try {
        const response = await axios.get(
          `http://localhost:8089/api/emergency-patients/${patientId}/estimated-wait-time`,
          { withCredentials: true },
        )
        setEstimatedWaitTime(response.data.estimatedWaitTime || "Unavailable")
      } catch (error) {
        console.error("Error fetching wait time:", error)
        setEstimatedWaitTime("Estimation unavailable")
        setErrorWaitTime("Could not retrieve estimated wait time.")
      } finally {
        setLoadingWaitTime(false)
      }
    }

    const fetchDoctorDetails = async () => {
      if (initialAssignedDoctor && typeof initialAssignedDoctor === "object" && initialAssignedDoctor !== null) {
        setDoctorInfo(initialAssignedDoctor)
      } else if (initialAssignedDoctor && typeof initialAssignedDoctor === "string") {
        setLoadingDoctor(true)
        try {
          const response = await axios.get(`http://localhost:8089/api/users/${initialAssignedDoctor}`, {
            withCredentials: true,
          })
          setDoctorInfo(response.data)
        } catch (error) {
          console.error("Error fetching doctor details:", error)
          setDoctorInfo({
            username: "Information Unavailable",
            specialization: "N/A",
            email: "N/A",
            _id: initialAssignedDoctor,
          })
        } finally {
          setLoadingDoctor(false)
        }
      } else {
        setDoctorInfo(null)
      }
    }

    if (patientId) {
      fetchWaitTime()
      fetchDoctorDetails()
    } else {
      console.error("Patient ID missing in location.state for ConfirmationEmergencyRegister.")
      setLoadingWaitTime(false)
      setLoadingDoctor(false)
    }
  }, [patientId, initialAssignedDoctor])

  const handleTrackStatusClick = () => {
    console.log("Navigating to /emergency-status with state:", {
      patientId,
      patientCode,
      doctorInfo,
    })
    navigate("/emergency-status", {
      state: {
        patientId,
        patientCode,
        doctorInfo,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 bg-gradient-to-br from-[#FEE2C5] to-[#C4DDFF]">
      <div className="fixed inset-0 z-0">
        <ParticlesComponent
          id="confirmation-particles"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "#ECEFCA",
          }}
        />
      </div>

      {!formData || !patientId ? (
        <Card className="max-w-md w-full shadow-lg rounded-2xl border border-red-200 bg-white transition-all duration-300 hover:shadow-xl">
          <CardHeader className="bg-red-50 rounded-t-2xl py-6 px-6">
            <CardTitle className="text-red-700 flex items-center justify-center text-2xl font-semibold">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Confirmation Error
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <p className="text-gray-600 text-center text-base">
              Confirmation information could not be found. Please try your registration again.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/home">Back to Home</Link>
              </Button>
              <Button asChild className="bg-red-600 text-white hover:bg-red-700 rounded-lg">
                <Link to="/emergency-register">New Request</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-4xl w-full mx-auto shadow-xl rounded-2xl border border-gray-200 bg-white bg-opacity-95 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <CardHeader className="bg-[#213448] text-white py-8 px-6">
            <CardTitle className="text-3xl font-bold flex items-center">
              <CheckCircle className="mr-3 h-8 w-8 text-[#94B4C1]" />
              Emergency Request Registered
            </CardTitle>
            <CardDescription className="text-[#94B4C1] text-lg mt-2">
              Your request has been successfully submitted. Here is a summary of the information.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 grid gap-8">
            <div className="bg-[#ECEFCA] bg-opacity-50 rounded-xl p-6 shadow-sm border border-[#94B4C1]">
              <h4 className="text-lg font-semibold text-[#213448] mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                </p>
                <p>
                  <span className="font-medium">Born on:</span>{" "}
                  {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString("en-US") : "N/A"}
                </p>
                <p>
                  <span className="font-medium">Gender:</span> {formData.gender}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {formData.phoneNumber}
                </p>
                {formData.email && (
                  <p>
                    <span className="font-medium">Email:</span> {formData.email}
                  </p>
                )}
                <p className="sm:col-span-2">
                  <span className="font-medium">Address:</span> {formData.address}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-medium">Emergency Contact:</span> {formData.emergencyContact}
                </p>
              </div>
            </div>

            <div className="bg-[#94B4C1] bg-opacity-30 rounded-xl p-6 shadow-sm border border-[#547792]">
              <h4 className="text-lg font-semibold text-[#213448] mb-4">Medical Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                {formData.insuranceInfo && (
                  <p>
                    <span className="font-medium">Insurance:</span> {formData.insuranceInfo}
                  </p>
                )}
                {formData.allergies && (
                  <p>
                    <span className="font-medium">Allergies:</span> {formData.allergies}
                  </p>
                )}
                {formData.currentMedications && (
                  <p>
                    <span className="font-medium">Current Medications:</span> {formData.currentMedications}
                  </p>
                )}
                {formData.medicalHistory && (
                  <p>
                    <span className="font-medium">Medical History:</span> {formData.medicalHistory}
                  </p>
                )}
                <p className="sm:col-span-2">
                  <span className="font-medium">Current Symptoms:</span> {formData.currentSymptoms}
                </p>
                <p>
                  <span className="font-medium">Pain Level:</span> {formData.painLevel}/10
                </p>
                <p>
                  <span className="font-medium">Emergency Level:</span> {formData.emergencyLevel}
                </p>
              </div>
            </div>

            <div className="bg-[#ECEFCA] bg-opacity-60 rounded-xl p-6 shadow-sm border border-[#94B4C1]">
              <h4 className="text-lg font-semibold text-[#213448] mb-4 flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-[#547792]" /> Next Steps
              </h4>
              <div className="space-y-3 text-gray-700 text-sm">
                <p className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-[#547792] flex-shrink-0" />
                  <strong className="w-40">Estimated wait time:</strong>
                  <span className={`font-semibold ${loadingWaitTime ? "italic text-gray-500" : ""}`}>
                    {loadingWaitTime ? "Calculating..." : estimatedWaitTime}
                    {errorWaitTime && <span className="text-red-500 text-xs ml-1">({errorWaitTime})</span>}
                  </span>
                </p>
                <div className="flex items-start">
                  <Stethoscope className="mr-2 h-4 w-4 text-[#547792] flex-shrink-0 mt-0.5" />
                  <strong className="w-40">Assigned Doctor:</strong>
                  {loadingDoctor ? (
                    <span className="italic text-gray-500">Loading...</span>
                  ) : doctorInfo ? (
                    <span className="font-semibold">
                      {doctorInfo.username}
                      {doctorInfo.specialization && ` (${doctorInfo.specialization})`}
                      {doctorInfo.email && `, Contact: ${doctorInfo.email}`}
                    </span>
                  ) : (
                    <span className="italic text-gray-500">Assignment in progress...</span>
                  )}
                </div>
                <p>
                  <strong>Stay Available:</strong> Our medical team will contact you shortly. Please keep
                  your phone nearby.
                </p>
                <p>
                  <strong>Preparation:</strong> Have your insurance card, list of current
                  medications, and any relevant medical documents ready.
                </p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button asChild variant="outline" className="rounded-lg">
                <Link to="/home">Back to Home</Link>
              </Button>
              <Button
                onClick={handleTrackStatusClick}
                className="text-white rounded-lg"
                style={{ backgroundColor: colors.primary, hover: { backgroundColor: colors.secondary } }}
              >
                Track Request Status
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ConfirmationEmergencyRegister