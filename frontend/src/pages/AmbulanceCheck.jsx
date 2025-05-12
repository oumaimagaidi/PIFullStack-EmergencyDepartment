import React, { useState, useEffect, useCallback, memo } from "react";
import Cookies from 'js-cookie';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Phone as PhoneIcon,
  Person as DriverIcon,
  LocalShipping as AmbulanceTypeIcon,
  Pin as PinIcon,
  EventAvailable as BookIcon,
} from "@mui/icons-material";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

// Animation de droite à gauche pour l'ambulance
const moveAmbulance = keyframes`
  0% { transform: translateX(100vw); }
  100% { transform: translateX(-100vw); }
`;

// Animation d'entrée pour les cartes
const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Styles des cartes
const AmbulanceCard = styled(Card)(({ theme }) => ({
  borderRadius: "14px",
  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
  background: "linear-gradient(145deg, #ffffff 0%, #e0f2fe 100%)",
  transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  borderLeft: "4px solid #1d4ed8",
  maxWidth: "250px",
  margin: "0 auto",
  animation: `${fadeInUp} 0.5s ease-out forwards`,
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 10px 25px rgba(29, 78, 216, 0.2)",
  },
}));

const CardContentWrapper = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

const BookButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
  color: "white",
  fontWeight: 700,
  padding: theme.spacing(0.8, 2),
  borderRadius: "8px",
  marginTop: theme.spacing(1),
  boxShadow: "0 3px 5px rgba(29, 78, 216, 0.2)",
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  fontSize: "0.85rem",
  "&:hover": {
    background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
    transform: "translateY(-2px)",
    boxShadow: "0 5px 10px rgba(29, 78, 216, 0.3)",
  },
  "&:disabled": {
    background: "#e5e7eb",
    color: "#9ca3af",
    boxShadow: "none",
  },
}));

const AmbulanceAnimation = styled("div")({
  position: "fixed",
  bottom: "60px",
  zIndex: 1,
  "& img": {
    width: "450px",
    height: "auto",
    animation: `${moveAmbulance} 12s linear infinite`,
    filter: "drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2))",
  },
});

// Styles pour le formulaire
const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: theme.palette.grey[300] },
    "&:hover fieldset": { borderColor: theme.palette.primary.main },
    "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    borderRadius: "8px",
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  color: "white",
  fontWeight: 700,
  padding: theme.spacing(1.5, 3),
  borderRadius: "8px",
  "&:hover": {
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    transform: "translateY(-2px)",
  },
  "&:disabled": {
    background: "#e5e7eb",
    color: "#9ca3af",
  },
}));

// Composant InfoItem
const InfoItem = ({ icon, label, value }) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.3 }}>
      {label === "Drivers" ? (
        <Avatar sx={{ bgcolor: "#e0f2fe", width: 24, height: 24, mr: 0.5 }}>
          👨‍✈️
        </Avatar>
      ) : (
        React.cloneElement(icon, { sx: { color: "#1d4ed8", fontSize: 16 } })
      )}
      <Typography
        variant="body2"
        sx={{ color: "#1f2937", fontWeight: 500, fontSize: "0.85rem" }}
      >
        <strong>{label}:</strong> {value || "N/A"}
      </Typography>
    </Box>
  );
};

// Composant de carte optimisé
const AmbulanceCardItem = memo(({ ambulance, onBookNow, index }) => {
  const isAvailable = ambulance.status === "AVAILABLE";

  return (
    <AmbulanceCard>
      <CardContentWrapper>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Avatar sx={{ bgcolor: "#e0f2fe", width: 36, height: 36 }}>
            🚑
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e40af", fontSize: "1.1rem" }}>
            Ambulance N°{index + 1}
          </Typography>
        </Box>
        <InfoItem
          icon={<DriverIcon />}
          label="Drivers"
          value={ambulance.drivers?.length ? ambulance.drivers.join(", ") : "N/A"}
        />
        <InfoItem icon={<PhoneIcon />} label="Contact" value={ambulance.mobile} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 0.5 }}>
          <BookButton onClick={() => onBookNow(ambulance._id)} disabled={!isAvailable}>
            <BookIcon sx={{ fontSize: 16 }} /> Book Now
          </BookButton>
        </Box>
      </CardContentWrapper>
    </AmbulanceCard>
  );
});

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Typography variant="h6" color="error">
            Something went wrong. Please try again later.
          </Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

const AmbulanceCheck = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    location: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [paymentLoading, setPaymentLoading] = useState(false);

 useEffect(() => {
  const fetchAmbulances = async () => {
    try {
      // Modification ici
      const token = Cookies.get("token");
      if (!token) {
        // Redirection immédiate si token manquant
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:8089/api/ambulance", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
        console.log("API Response:", response.data);

        const ambulanceData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setAmbulances(ambulanceData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching ambulances:", err);
        setError("Failed to load ambulances. Please try again later.");
        setLoading(false);
        setAmbulances([]);
        if (err.response?.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };
    fetchAmbulances();
  }, [navigate]);

  const handleBookNow = useCallback((id) => {
    setSelectedAmbulanceId(id);
    setOpenBookingDialog(true);
  }, []);

  const handleCloseDialog = () => {
    setOpenBookingDialog(false);
    setSelectedAmbulanceId(null);
    setFormData({ name: "", address: "", email: "", phone: "", location: "" });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let errors = { ...formErrors };
    if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
      errors.email = "Please enter a valid email";
    } else if (name === "phone" && value && !/^[0-9]{8,15}$/.test(value)) {
      errors.phone = "Phone number must be 8-15 digits";
    } else {
      delete errors[name];
    }
    setFormErrors(errors);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Please enter a valid email";
    if (!formData.phone) errors.phone = "Phone number must be 8-15 digits";
    else if (!/^[0-9]{8,15}$/.test(formData.phone)) errors.phone = "Phone number must be 8-15 digits";
    if (!formData.location) errors.location = "Location is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setPaymentLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/payments/generate`,
          {
            ambulanceId: selectedAmbulanceId,
            userData: formData,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          window.location.href = response.data.paymentLink;
        } else {
          throw new Error(response.data.message || "Payment initiation failed");
        }
      } catch (err) {
        console.error("Error generating payment link:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          const errorMessage = err.response?.data?.message || err.message || "Failed to initiate payment. Please try again.";
          alert(errorMessage);
        }
        setPaymentLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Background Particles */}
      <Box sx={{ position: "fixed", inset: 0, zIndex: -1 }}>
        <Particles
          id="ambulance-particles"
          init={async (main) => await loadFull(main)}
          options={{
            background: {
              color: { value: "#E8F4F8" },
            },
            particles: {
              number: { value: 100, density: { enable: true, value_area: 800 } },
              color: { value: "#1d4ed8" },
              shape: { type: "circle" },
              opacity: { value: 0.8, random: true },
              size: { value: 4, random: true },
              move: { enable: true, speed: 3, direction: "none", random: true },
            },
            interactivity: {
              events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" },
              },
              modes: {
                repulse: { distance: 100 },
                push: { quantity: 4 },
              },
            },
            detectRetina: true,
          }}
        />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          minHeight: "100vh",
          background: "rgba(248, 250, 252, 0.95)",
          padding: theme.spacing(8, 2),
          position: "relative",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#1e40af",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              textTransform: "uppercase",
            }}
          >
            <br />
            🚑 Available Ambulances
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#64748b", fontWeight: 500 }}>
            Select an ambulance for emergency service
          </Typography>
        </Box>

        {/* Grille des ambulances */}
        <Box sx={{ maxWidth: "1500px", margin: "0 auto", position: "relative", zIndex: 2 }}>
          {!Array.isArray(ambulances) || ambulances.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                borderRadius: 2,
                backgroundColor: "white",
                boxShadow: theme.shadows[2],
                maxWidth: "500px",
                margin: "0 auto",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                No ambulances available at this time
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3} justifyContent="center">
              {ambulances.map((ambulance, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={ambulance._id}>
                  <AmbulanceCardItem
                    ambulance={ambulance}
                    onBookNow={handleBookNow}
                    index={index}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Animation */}
        <AmbulanceAnimation>
          <img src="/Ambulance/logo.png" alt="Ambulance animation" />
        </AmbulanceAnimation>

        {/* Popup de réservation */}
        <Dialog open={openBookingDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: "#1d4ed8", color: "white", textAlign: "center" }}>
            Book Ambulance
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box component="form" onSubmit={handleFormSubmit}>
              <FormField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
              <FormField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                error={!!formErrors.address}
                helperText={formErrors.address}
                required
              />
              <FormField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
              <FormField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone}
                required
                inputProps={{ maxLength: 15 }}
              />
              <FormField
                fullWidth
                label="Pickup Location"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                error={!!formErrors.location}
                helperText={formErrors.location}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <Button onClick={handleCloseDialog} color="secondary">
              Cancel
            </Button>
            <SubmitButton type="submit" onClick={handleFormSubmit} disabled={paymentLoading}>
              {paymentLoading ? <CircularProgress size={24} /> : "Proceed to Payment"}
            </SubmitButton>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

const WrappedAmbulanceCheck = () => (
  <ErrorBoundary>
    <AmbulanceCheck />
  </ErrorBoundary>
);

export default WrappedAmbulanceCheck;