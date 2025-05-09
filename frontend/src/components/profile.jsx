import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
// ProfileHeader n'est plus importé/utilisé directement ici
import ProfileContent from './ProfileContent';
import LoadingState from './LoadingState';
import { toast } from 'sonner';


const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(null); // Initialiser à null pour mieux gérer l'état de chargement
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        // Idéalement, rediriger vers la page de connexion
        return;
    }

    axios.get('http://localhost:8089/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      // S'assurer que la structure attendue est là
      const data = response.data;
      setProfileData({
        personal: data.personal || {},
        contact: data.contact || {}, // Assurez-vous que ces sections existent ou initialisez-les
        emergencyContacts: data.emergencyContacts || {},
        settings: data.settings || {},
        medical: data.medical || {},
        professional: data.professional || {},
        certifications: data.certifications || {},
        appointments: data.appointments || {},
        // ... autres sections si nécessaire
      });
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching profile:', error);
      if (error.response) {
        setError(`Error ${error.response.status}: ${error.response.data.message || 'Failed to load profile'}`);
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Error setting up request: ' + error.message);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    // ... (votre logique handleSave existante)
    // Assurez-vous que profileData est bien structuré avant l'envoi
    // et que le backend attend cette structure.
    try {
      const token = Cookies.get("token");
      // Filtrer les sections vides si le backend ne les gère pas
      const dataToSave = { ...profileData };
      Object.keys(dataToSave).forEach(key => {
        if (Object.keys(dataToSave[key]).length === 0) {
          delete dataToSave[key]; // Optionnel: supprimer les sections vides
        }
      });

      const response = await axios.put('http://localhost:8089/api/profile', dataToSave, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const updatedData = response.data;
         setProfileData({ // S'assurer de réinitialiser toutes les sections
            personal: updatedData.personal || {},
            contact: updatedData.contact || {},
            emergencyContacts: updatedData.emergencyContacts || {},
            settings: updatedData.settings || {},
            medical: updatedData.medical || {},
            professional: updatedData.professional || {},
            certifications: updatedData.certifications || {},
            appointments: updatedData.appointments || {},
         });
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        throw new Error(`Failed to update profile - Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
      // setError peut aussi être utilisé pour afficher l'erreur dans l'UI si besoin
    }
  };

  const handleEdit = (section, field, value) => {
    setProfileData(prev => {
      // Si la section n'existe pas, l'initialiser
      const currentSectionData = prev[section] || {};
      return {
        ...prev,
        [section]: {
          ...currentSectionData,
          [field]: value
        }
      };
    });
  };

  if (loading) return <LoadingState />;
  if (error || !profileData) { // Ajout de !profileData pour le cas où les données ne sont pas chargées
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        {/* ... (votre UI d'erreur) ... */}
         <p className="text-gray-600 mb-4">{error || "Failed to load profile data."}</p>
      </div>
    );
  }

  return (
    // ProfileContent gère son propre fond et le ProfileHeader
    <ProfileContent
      profileData={profileData}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      handleEdit={handleEdit}
      handleSave={handleSave}
    />
  );
};

export default Profile;