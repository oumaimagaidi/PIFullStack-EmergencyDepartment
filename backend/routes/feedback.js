import express from "express";
import Feedback from "../models/Feedback.js";
import { authenticateToken, authorize } from "../middleware/authMiddleware.js";
import { User } from "../models/User.js";
const router = express.Router();

// Get all feedback with user details (accessible à tous)
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'username profileImage role') // Ajout du rôle pour l'affichage
      .sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit new feedback (protégé par authentification)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { feedback, rating } = req.body;
    const userId = req.user.id;

    // Vérifier si l'utilisateur a déjà soumis un feedback
    const existingFeedback = await Feedback.findOne({ user: userId });
    if (existingFeedback) {
      return res.status(400).json({ 
        message: "Vous avez déjà soumis un feedback",
        existingFeedback
      });
    }

    const newFeedback = new Feedback({
      user: userId,
      feedback,
      rating,
    });

    const savedFeedback = await newFeedback.save();

    // Populate user details before sending response
    const populatedFeedback = await Feedback.populate(savedFeedback, {
      path: 'user',
      select: 'username profileImage role'
    });

    // Emit new feedback to all connected clients via Socket.IO
    if (req.io) {
      req.io.emit("newFeedback", populatedFeedback);
    }

    res.status(201).json(populatedFeedback);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get feedback for current user (protégé par authentification)
router.get("/my-feedback", authenticateToken, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ user: req.user.id })
      .populate('user', 'username profileImage');
      
    res.json(feedback || { message: "Vous n'avez pas encore soumis de feedback" });
  } catch (error) {
    console.error("Error fetching user feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get average rating (accessible à tous)
router.get("/average", async (req, res) => {
  try {
    const result = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (result.length > 0) {
      res.json({
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        count: result[0].count,
      });
    } else {
      res.json({ averageRating: 0, count: 0 });
    }
  } catch (error) {
    console.error("Error calculating average rating:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Route admin pour supprimer un feedback (optionnel)
router.delete("/:id", authenticateToken, authorize(['Administrator']), async (req, res) => {
  try {
    const deletedFeedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!deletedFeedback) {
      return res.status(404).json({ message: "Feedback non trouvé" });
    }

    if (req.io) {
      req.io.emit("feedbackDeleted", { id: req.params.id });
    }

    res.json({ message: "Feedback supprimé avec succès" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;