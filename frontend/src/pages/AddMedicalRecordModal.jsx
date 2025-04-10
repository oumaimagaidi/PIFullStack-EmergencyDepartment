// src/components/AddMedicalRecordModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './AddMedicalRecordModal.css';

const AddMedicalRecordModal = ({ patients, onClose, onRecordAdded }) => {
  const [formData, setFormData] = useState({
    emergencyPatientId: '',
    bloodType: '',
    knownAllergies: '',
    patientFiles: [],
  });
  const [fileData, setFileData] = useState({ type: '', notes: '', details: {} });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8089/api/medical-records/create-for-emergency',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRecordAdded(response.data.medicalRecord);
      onClose();
    } catch (err) {
      console.error('Erreur lors de la création du dossier médical:', err);
    }
  };

  const handleAddFile = () => {
    setFormData((prev) => ({
      ...prev,
      patientFiles: [...prev.patientFiles, fileData],
    }));
    setFileData({ type: '', notes: '', details: {} });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Ajouter un Dossier Médical</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Patient :
            <select
              value={formData.emergencyPatientId}
              onChange={(e) => setFormData({ ...formData, emergencyPatientId: e.target.value })}
            >
              <option value="">Sélectionner un patient</option>
              {patients.map((patient) => (
                <option key={patient._id} value={patient._id}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
          </label>
          <label>
            Type de sang :
            <input
              type="text"
              value={formData.bloodType}
              onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
            />
          </label>
          <label>
            Allergies :
            <input
              type="text"
              value={formData.knownAllergies}
              onChange={(e) => setFormData({ ...formData, knownAllergies: e.target.value.split(',') })}
            />
          </label>

          <h3>Ajouter un Fichier Patient</h3>
          <label>
            Type :
            <select
              value={fileData.type}
              onChange={(e) => setFileData({ ...fileData, type: e.target.value })}
            >
              <option value="">Sélectionner un type</option>
              <option value="PatientInformation">Informations Patient</option>
              <option value="Triage">Triage</option>
              <option value="VitalSigns">Signes Vitaux</option>
            </select>
          </label>
          <label>
            Notes :
            <input
              type="text"
              value={fileData.notes}
              onChange={(e) => setFileData({ ...fileData, notes: e.target.value })}
            />
          </label>
          {/* Simplifié : Ajoutez des champs spécifiques pour details selon le type si nécessaire */}
          <button type="button" onClick={handleAddFile}>
            Ajouter ce Fichier
          </button>

          <button type="submit">Créer le Dossier</button>
          <button type="button" onClick={onClose}>
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMedicalRecordModal;