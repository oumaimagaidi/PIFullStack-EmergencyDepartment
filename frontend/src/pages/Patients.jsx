import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, UserPlus, Calendar, Phone, User, Mail, Heart, MapPin, AlertTriangle, Stethoscope } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Patients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPatient, setNewPatient] = useState({
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "Patient",
    name: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContact: "",
    bloodType: "",
    allergies: [],
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const navigate = useNavigate();

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found, redirecting to login");
          setError("Session expired. Please log in again.");
          navigate("/login");
          return;
        }

        console.log("Fetching patients with token:", token.substring(0, 20) + "...");
        const response = await axios.get("http://localhost:8089/api/users/patients", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response data:", response.data);
        if (response.data.success !== true) {
          throw new Error(response.data.message || "Failed to retrieve patients");
        }
        const fetchedPatients = response.data.patients || [];
        setPatients(fetchedPatients);
      } catch (err) {
        console.error("Error fetching patients:", err.response ? err.response.data : err.message);
        if (err.response) {
          switch (err.response.status) {
            case 401:
              setError("Session expired. Please log in again.");
              localStorage.removeItem("token");
              navigate("/login");
              break;
            case 403:
              setError(err.response.data.message || "Access denied. Only administrators, doctors, or nurses can view patients.");
              break;
            case 404:
              setError("No patients found.");
              break;
            default:
              setError(`Server error: ${err.response.data?.message || "Unable to retrieve patients."}`);
          }
        } else {
          setError("Network error. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [navigate]);

  // Handle form input changes for adding a new patient
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({
      ...prev,
      [name]: name === "allergies" ? value.split(",").map((item) => item.trim()) : value,
    }));
  };

  // Handle form submission for adding a new patient
  const handleAddPatient = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Basic validation
    const requiredFields = [
      "username",
      "email",
      "password",
      "phoneNumber",
      "name",
      "dateOfBirth",
      "gender",
      "address",
      "emergencyContact",
      "bloodType",
    ];
    for (const field of requiredFields) {
      if (!newPatient[field]) {
        setFormError(`Please fill in the ${field} field.`);
        return;
      }
    }

    // Phone number validation
    if (!/^\+\d{10,15}$/.test(newPatient.phoneNumber)) {
      setFormError("Phone number must start with '+' followed by 10-15 digits (e.g., +12345678901).");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await axios.post("http://localhost:8089/api/auth/register", newPatient, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Add patient response:", response.data);
      if (response.data.success) {
        setFormSuccess("Patient added successfully!");
        setPatients((prev) => [...prev, response.data.user]);
        setNewPatient({
          username: "",
          email: "",
          password: "",
          phoneNumber: "",
          role: "Patient",
          name: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          emergencyContact: "",
          bloodType: "",
          allergies: [],
        });
        setTimeout(() => setFormSuccess(null), 2000);
      } else {
        throw new Error(response.data.message || "Failed to add patient.");
      }
    } catch (err) {
      console.error("Error adding patient:", err.response ? err.response.data : err.message);
      setFormError(err.response?.data?.message || "Failed to add patient. Please try again.");
    }
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            <span className="flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-blue-600" /> Gestion des Patients
            </span>
          </h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-blue-600 text-white gap-2 hover:bg-blue-700 transition-all duration-300 shadow-md">
                <UserPlus className="h-5 w-5" /> Ajouter un Patient
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-white p-6 rounded-lg shadow-lg">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold text-gray-800">Ajouter un Nouveau Patient</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleAddPatient} className="space-y-4 mt-6">
                {formError && (
                  <p className="text-red-500 bg-red-50 p-2 rounded-lg">{formError}</p>
                )}
                {formSuccess && (
                  <p className="text-green-500 bg-green-50 p-2 rounded-lg">{formSuccess}</p>
                )}
                <Input
                  name="username"
                  placeholder="Nom d'utilisateur"
                  value={newPatient.username}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={newPatient.email}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Mot de passe"
                  value={newPatient.password}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  name="phoneNumber"
                  placeholder="Numéro de téléphone (ex: +12345678901)"
                  value={newPatient.phoneNumber}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  name="name"
                  placeholder="Nom complet"
                  value={newPatient.name}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  name="dateOfBirth"
                  type="date"
                  placeholder="Date de naissance"
                  value={newPatient.dateOfBirth}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  name="gender"
                  value={newPatient.gender}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner le genre</option>
                  <option value="Male">Homme</option>
                  <option value="Female">Femme</option>
                  <option value="Other">Autre</option>
                </select>
                <Input
                  name="address"
                  placeholder="Adresse"
                  value={newPatient.address}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <Input
                  name="emergencyContact"
                  placeholder="Contact d'urgence (ex: +12345678901)"
                  value={newPatient.emergencyContact}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  name="bloodType"
                  value={newPatient.bloodType}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner le groupe sanguin</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <Input
                  name="allergies"
                  placeholder="Allergies (séparées par des virgules)"
                  value={newPatient.allergies.join(", ")}
                  onChange={handleInputChange}
                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300"
                >
                  Enregistrer
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        {/* Patients List */}
        <Card className="shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-semibold text-gray-800">Liste des Patients</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher un patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <motion.div
                  className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
            ) : error ? (
              <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</p>
            ) : (
              <div className="space-y-4">
                {filteredPatients.length === 0 ? (
                  <p className="text-center text-gray-500 text-lg font-medium">
                    Aucun patient trouvé.
                  </p>
                ) : (
                  filteredPatients.map((patient) => (
                    <motion.div
                      key={patient._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-300 shadow-sm border border-gray-200"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedPatient(patient);
                        setIsDetailsOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            patient.profileImage
                              ? `http://localhost:8089${patient.profileImage}`
                              : "https://via.placeholder.com/50?text=User"
                          }
                          alt={patient.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                          onError={(e) => (e.target.src = "https://via.placeholder.com/50?text=User")}
                        />
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{patient.name}</h3>
                          <p className="text-sm text-gray-600">
                            {patient.bloodType || "N/A"} | {patient.gender || "N/A"}
                          </p>
                        </div>
                      </div>
                      <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300">
                        Détails
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Details Dialog */}
        <AnimatePresence>
          {isDetailsOpen && selectedPatient && (
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                      Détails du Patient
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Informations sur {selectedPatient.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 p-4">
                    <div className="flex justify-center">
                      <img
                        src={
                          selectedPatient.profileImage
                            ? `http://localhost:8089${selectedPatient.profileImage}`
                            : "https://via.placeholder.com/100?text=User"
                        }
                        alt={selectedPatient.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow-md"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/100?text=User")}
                      />
                    </div>
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <User className="inline w-4 h-4 text-blue-600" /> Nom :
                      </strong>{" "}
                      {selectedPatient.name}
                    </p>
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <Mail className="inline w-4 h-4 text-blue-600" /> Email :
                      </strong>{" "}
                      {selectedPatient.email || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <Phone className="inline w-4 h-4 text-blue-600" /> Téléphone :
                      </strong>{" "}
                      {selectedPatient.phoneNumber || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <Calendar className="inline w-4 h-4 text-blue-600" /> Date de Naissance :
                      </strong>{" "}
                      {selectedPatient.dateOfBirth
                        ? new Date(selectedPatient.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <Heart className="inline w-4 h-4 text-blue-600" /> Groupe Sanguin :
                      </strong>{" "}
                      {selectedPatient.bloodType || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <User className="inline w-4 h-4 text-blue-600" /> Genre :
                      </strong>{" "}
                      {selectedPatient.gender || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <MapPin className="inline w-4 h-4 text-blue-600" /> Adresse :
                      </strong>{" "}
                      {selectedPatient.address || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <Phone className="inline w-4 h-4 text-blue-600" /> Contact d'Urgence :
                      </strong>{" "}
                      {selectedPatient.emergencyContact || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <strong className="flex items-center gap-2">
                        <AlertTriangle className="inline w-4 h-4 text-blue-600" /> Allergies :
                      </strong>{" "}
                      {selectedPatient.allergies?.length > 0
                        ? selectedPatient.allergies.join(", ")
                        : "Aucune"}
                    </p>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button className="bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 w-full">
                        Fermer
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Patients;