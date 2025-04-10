

import express from 'express';
import mongoose from 'mongoose';
import EmergencyPatient from '../models/EmergencyPatient.js';
import { User } from '../models/User.js';




const router = express.Router();


const findAvailableDoctor = async () => {
  try {
    // Recherche un médecin qui est validé ET disponible
    const doctor = await User.findOne({
        role: 'Doctor',
        isValidated: true,
        isAvailable: true // Critère crucial
    });
    return doctor;
  } catch (error) {
    console.error("Erreur lors de la recherche d'un médecin disponible:", error);
    return null; // Retourne null en cas d'erreur pour ne pas bloquer
  }
};


router.post('/', async (req, res) => {
  try {
   
    const patient = new EmergencyPatient({ ...req.body });
    let savedPatient = await patient.save(); 

    
    const availableDoctor = await findAvailableDoctor();

   
    if (availableDoctor) {
      savedPatient.assignedDoctor = availableDoctor._id; 
   
      savedPatient = await savedPatient.save();

     
      try {
          await User.findByIdAndUpdate(availableDoctor._id, { isAvailable: false });
          console.log(`Statut du médecin ${availableDoctor.username} (ID: ${availableDoctor._id}) mis à jour à 'Occupé'.`);
      } catch (doctorUpdateError) {
          console.error(`ERREUR CRITIQUE: Échec de la mise à jour de la disponibilité du médecin ${availableDoctor._id}.`, doctorUpdateError);
      }

      console.log(`Médecin ${availableDoctor.username} (ID: ${availableDoctor._id}) assigné au patient ${savedPatient.firstName} ${savedPatient.lastName} (ID: ${savedPatient._id})`);

      
      const notificationDataForDoctor = {
          type: 'assignment',
          message: `Nouveau cas urgence assigné : ${savedPatient.firstName} ${savedPatient.lastName}.`,
          patientId: savedPatient._id,
          patientName: `${savedPatient.firstName} ${savedPatient.lastName}`,
          symptoms: savedPatient.currentSymptoms,
          emergencyLevel: savedPatient.emergencyLevel,
          timestamp: new Date()
      };
     // sendNotificationToUser(availableDoctor._id, 'new_assignment', notificationDataForDoctor);

      const notificationDataForStaff = {
          type: 'info',
          message: `Dr. ${availableDoctor.username} assigné à ${savedPatient.firstName} ${savedPatient.lastName}. Statut: Occupé.`,
          doctorId: availableDoctor._id,
          doctorName: availableDoctor.username,
          patientId: savedPatient._id,
          patientName: `${savedPatient.firstName} ${savedPatient.lastName}`,
          timestamp: new Date()
      };
     // sendNotificationToRole('Nurse', 'doctor_assigned_info', notificationDataForStaff);
      //sendNotificationToRole('Administrator', 'doctor_assigned_info', notificationDataForStaff);
   

    } else {
      console.warn(`WARN: Aucun médecin disponible trouvé pour assigner au patient ${savedPatient.firstName} ${savedPatient.lastName} (ID: ${savedPatient._id}).`);
    }

  
    const responsePatient = await EmergencyPatient.findById(savedPatient._id)
                                                  .populate('assignedDoctor', 'username specialization email profileImage');
    res.status(201).json(responsePatient || savedPatient); // Renvoyer la version peuplée si possible

  } catch (error) {
     console.error("Erreur lors de l'enregistrement/assignation de la demande d'urgence:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      res.status(400).json({ message: "Erreur de validation", details: messages });
    } else {
      res.status(500).json({ message: 'Erreur Serveur Interne' });
    }
  }
});


router.get('/', async (req, res) => {
    try {
      const emergencyPatients = await EmergencyPatient.find();
      res.status(200).json(emergencyPatients);
    } catch (error) {
      console.error("Erreur lors de la récupération des demandes d'urgence:", error);
      res.status(500).json({ message: "Erreur serveur lors de la récupération des demandes d'urgence" });
    }
  });


router.get('/:id/details', async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID de demande invalide" });
    }

    try {
        const patient = await EmergencyPatient.findById(id)
            .populate('assignedDoctor', 'username specialization email profileImage');

        if (!patient) {
            return res.status(404).json({ message: "Demande d'urgence non trouvée" });
        }

        res.status(200).json(patient);
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de la demande:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des détails" });
    }
});


router.put('/:id/status',  async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;


  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de demande invalide" });
  }

  const allowedStatuses = ['Demande Enregistrée', 'En Cours d\'Examen', 'Médecin Assigné', 'Médecin En Route', 'Traité', 'Annulé']; // Exemple
  if (!status || typeof status !== 'string' || !allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Le champ 'status' est requis et doit être une des valeurs suivantes : ${allowedStatuses.join(', ')}.` });
  }

  try {
    const updatedPatient = await EmergencyPatient.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true } // Retourne le document mis à jour
    ).populate('assignedDoctor', 'username specialization email'); // Populer si besoin

    if (!updatedPatient) {
      return res.status(404).json({ message: "Demande d'urgence non trouvée" });
    }



    res.status(200).json(updatedPatient);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
     if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        res.status(400).json({ message: "Erreur de validation", details: messages });
     } else {
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour du statut" });
     }
  }
});


router.delete('/:id', async (req, res) => {


  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "ID de demande invalide" });
  }

  try {
    const deletedPatient = await EmergencyPatient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return res.status(404).json({ message: "Demande d'urgence non trouvée" });
    }

    // Si un médecin était assigné, le rendre à nouveau disponible
    if (deletedPatient.assignedDoctor) {
       try {
           const doctor = await User.findByIdAndUpdate(deletedPatient.assignedDoctor, { isAvailable: true });
           if(doctor) {
               console.log(`Médecin ${doctor.username} (ID: ${doctor._id}) rendu disponible après suppression du cas ${id}`);
               // Optionnel : Notifier l'admin/médecin que le médecin est de nouveau dispo ?
           } else {
               console.warn(`Tentative de rendre disponible un médecin (ID: ${deletedPatient.assignedDoctor}) après suppression du cas ${id}, mais médecin non trouvé.`);
           }
       } catch (doctorUpdateError) {
            console.error(`Erreur lors de la remise à dispo du médecin ${deletedPatient.assignedDoctor} après suppression du cas ${id}`, doctorUpdateError);
       }
    }

    res.status(200).json({ message: "Demande d'urgence supprimée avec succès", deletedId: id });
  } catch (error) {
    console.error("Erreur lors de la suppression de la demande d'urgence:", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
});



export default router;