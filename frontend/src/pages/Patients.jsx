import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Search, UserPlus, Calendar, Phone, User, Mail, Heart } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Patients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:8089/api/users/patients", { withCredentials: true });
        setPatients(response.data);
      } catch (err) {
        setError("Impossible de récupérer les patients.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => patient.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Patients</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-blue-600 text-white gap-2 hover:bg-blue-500">
                <UserPlus className="h-4 w-4" /> Ajouter Patient
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Ajouter un Nouveau Patient</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <Input placeholder="Nom Complet" />
                <Input placeholder="Âge" type="number" />
                <Input placeholder="Condition Médicale" />
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-500">Enregistrer</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Carte de la liste des patients */}
        <Card className="shadow-lg bg-white rounded-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold">Liste des Patients</CardTitle>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-72 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-600">Chargement...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : (
              <div className="space-y-4">
                {filteredPatients.map((patient) => (
                  <motion.div
                    key={patient._id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => { setSelectedPatient(patient); setIsDetailsOpen(true); }}
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800">{patient.name}</h3>
                      <p className="text-sm text-gray-600">Âge: {patient.age} | {patient.condition}</p>
                    </div>
                    <Button className="bg-blue-600 text-white hover:bg-blue-500">Voir</Button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Détails du patient (dialogue) */}
        <AnimatePresence>
          {isDetailsOpen && selectedPatient && (
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <DialogHeader>
                    <DialogTitle>Détails du Patient</DialogTitle>
                    <DialogDescription>Informations sur {selectedPatient.name}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 p-4">
                    <p><strong><User className="inline w-4 h-4" /> Nom:</strong> {selectedPatient.name}</p>
                    <p><strong><Mail className="inline w-4 h-4" /> Email:</strong> {selectedPatient.email}</p>
                    <p><strong><Phone className="inline w-4 h-4" /> Téléphone:</strong> {selectedPatient.phoneNumber}</p>
                    <p><strong><Calendar className="inline w-4 h-4" /> Date de Naissance:</strong> {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong><Heart className="inline w-4 h-4" /> Groupe Sanguin:</strong> {selectedPatient.bloodType}</p>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button className="bg-blue-600 text-white hover:bg-blue-500">Fermer</Button>
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