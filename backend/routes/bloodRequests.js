import express from "express";
import mongoose from "mongoose";
import BloodRequest from "../models/BloodRequest.js";
import { authenticateToken, authorize } from "../middleware/authMiddleware.js"; // Assuming you have authorize middleware
import EmergencyPatient from "../models/EmergencyPatient.js"; // Or User if patients are Users
import { User } from "../models/User.js"; // For populating staff info
import DonationPledge from "../models/DonationPledge.js"; 
const router = express.Router();

// Middleware to authorize only medical staff (Doctor, Nurse, Administrator) for certain actions
const authorizeMedicalStaff = authorize(["Doctor", "Nurse", "Administrator"]);
const authorizeDoctorNurse = authorize(["Doctor", "Nurse"]);
const authorizeAdmin = authorize(["Administrator"]);

// == POST /api/blood-requests ==
// Create a new blood request
router.post("/", authenticateToken, authorizeMedicalStaff, async (req, res) => {
  try {
    const {
      patientId,
      bloodTypeNeeded,
      quantityNeeded,
      urgency,
      reason,
      hospitalLocation,
      contactPerson,
      contactPhone,
      notes,
      expiresAt,
    } = req.body;

    // Validate patientId exists
    const patient = await EmergencyPatient.findById(patientId); // Or User.findById(patientId) if using User model for patients
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const newBloodRequest = new BloodRequest({
      patientId,
      requestingStaffId: req.user.id, // ID of the logged-in staff member
      bloodTypeNeeded,
      quantityNeeded,
      urgency,
      reason,
      hospitalLocation,
      contactPerson,
      contactPhone,
      notes,
      expiresAt,
      status: "Open", // Default status
    });

    const savedRequest = await newBloodRequest.save();
    // TODO: Potentially emit a WebSocket event for new blood request: req.io.emit('newBloodRequest', savedRequest);

    res.status(201).json(savedRequest);
  } catch (error) {
    console.error("Error creating blood request:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error creating blood request", error: error.message });
  }
});

// == GET /api/blood-requests/active ==
// Get all active (Open or Partially Fulfilled) blood requests (for public/donor view)
// This route might not need strict authentication or could be open to all logged-in users
router.get("/active", async (req, res) => {
  try {
    const activeRequests = await BloodRequest.find({
      status: { $in: ["Open", "Partially Fulfilled"] },
      $or: [ // Optionally filter out expired requests if expiresAt is used
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
      ]
    })
      .populate("patientId", "firstName lastName bloodType") // Populate limited patient info for privacy
      .populate("requestingStaffId", "username") // Staff who created it
      .sort({ urgency: 1, createdAt: -1 }); // Sort by urgency then by newest

    res.status(200).json(activeRequests);
  } catch (error) {
    console.error("Error fetching active blood requests:", error);
    res.status(500).json({ message: "Server error fetching active blood requests", error: error.message });
  }
});

// == GET /api/blood-requests/all ==
// Get ALL blood requests (for admin/staff view)
router.get("/all", authenticateToken, authorizeMedicalStaff, async (req, res) => {
  try {
    const allRequests = await BloodRequest.find({})
      .populate("patientId", "firstName lastName bloodType")
      .populate("requestingStaffId", "username role")
      .sort({ createdAt: -1 });
    res.status(200).json(allRequests);
  } catch (error) {
    console.error("Error fetching all blood requests:", error);
    res.status(500).json({ message: "Server error fetching all blood requests", error: error.message });
  }
});

// == GET /api/blood-requests/:id ==
// Get a specific blood request by ID
router.get("/:id", authenticateToken, async (req, res) => { // Authenticate to ensure logged-in user
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid blood request ID format." });
    }
    const request = await BloodRequest.findById(req.params.id)
      .populate("patientId") // Populate with more patient details if needed for staff
      .populate("requestingStaffId", "username role email phoneNumber");

    if (!request) {
      return res.status(404).json({ message: "Blood request not found." });
    }
    res.status(200).json(request);
  } catch (error) {
    console.error("Error fetching blood request by ID:", error);
    res.status(500).json({ message: "Server error fetching blood request", error: error.message });
  }
});

// == PUT /api/blood-requests/:id ==
// Update a blood request (e.g., update status, quantityFulfilled)
router.put("/:id", authenticateToken, authorizeMedicalStaff, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid blood request ID format." });
    }

    const { quantityFulfilled, status, notes, ...otherUpdatableFields } = req.body;
    const updateData = { ...otherUpdatableFields };

    if (quantityFulfilled !== undefined) {
      updateData.quantityFulfilled = Number(quantityFulfilled);
    }
    if (status) {
      updateData.status = status;
    }
    if (notes) {
      updateData.notes = notes;
    }

    // Ensure quantityFulfilled does not exceed quantityNeeded
    const existingRequest = await BloodRequest.findById(req.params.id);
    if (!existingRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }
    if (updateData.quantityFulfilled > existingRequest.quantityNeeded) {
      return res.status(400).json({ message: "Fulfilled quantity cannot exceed needed quantity." });
    }

    // Auto-update status to "Fulfilled" or "Partially Fulfilled"
    if (updateData.quantityFulfilled !== undefined) {
        if (updateData.quantityFulfilled >= existingRequest.quantityNeeded) {
            updateData.status = "Fulfilled";
        } else if (updateData.quantityFulfilled > 0) {
            updateData.status = "Partially Fulfilled";
        }
        // If quantityFulfilled is 0, status might be "Open" or manually set.
    }


    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate("patientId", "firstName lastName bloodType")
    .populate("requestingStaffId", "username role");

    if (!updatedRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    // TODO: Potentially emit WebSocket event for updated blood request: req.io.emit('updateBloodRequest', updatedRequest);

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error updating blood request:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error updating blood request", error: error.message });
  }
});

// == DELETE /api/blood-requests/:id ==
// Delete a blood request (Admin only, or perhaps the creating staff if not fulfilled)
router.delete("/:id", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid blood request ID format." });
    }
    const deletedRequest = await BloodRequest.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }
    // TODO: Potentially emit WebSocket event for deleted blood request: req.io.emit('deleteBloodRequest', { id: req.params.id });
    res.status(200).json({ message: "Blood request deleted successfully." });
  } catch (error) {
    console.error("Error deleting blood request:", error);
    res.status(500).json({ message: "Server error deleting blood request", error: error.message });
  }
});
router.post("/:requestId/pledge", authenticateToken, async (req, res) => {
  console.log("--- New Pledge Request ---");
  console.log("Initial req.user from token:", JSON.stringify(req.user, null, 2));

  try {
    const { requestId } = req.params;
    const { donorContactPhone, donorBloodType, pledgedQuantity, donationNotes } = req.body;
    const donorUserId = req.user.id; // This ID comes from the token

    // --- FETCH FULL USER DETAILS USING THE ID FROM THE TOKEN ---
    let pledgingUser;
    try {
      // Fetch user and their current unlockedBadges and donationCount
      pledgingUser = await User.findById(donorUserId).select("username phoneNumber donationCount unlockedBadges").lean();
    } catch (userFetchError) {
      console.error(`Error fetching user details for ID ${donorUserId}:`, userFetchError);
      return res.status(500).json({ message: "Server error: Could not retrieve donor information." });
    }

    if (!pledgingUser) {
      console.error(`CRITICAL: User with ID ${donorUserId} not found in database, but token was valid.`);
      return res.status(404).json({ message: "Donor user account not found." });
    }

    const donorName = pledgingUser.username;

    // Fallback for phone number if not provided in form but available in user profile
    const finalDonorContactPhone = donorContactPhone || pledgingUser.phoneNumber;

    console.log(`Pledge attempt by User ID: ${donorUserId}, Username: ${donorName}, Contact: ${finalDonorContactPhone}`);

    // --- Validations ---
    if (!donorName) {
        console.error("Critical Error: donorName is undefined even after fetching user from DB. User object:", pledgingUser);
        return res.status(500).json({ message: "Server error: Could not retrieve donor name." });
    }
    if (!finalDonorContactPhone) {
        return res.status(400).json({ message: "Donor contact phone is required either in the form or in your profile." });
    }
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid blood request ID." });
    }

    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }
    if (["Fulfilled", "Closed", "Cancelled"].includes(bloodRequest.status)) {
        return res.status(400).json({ message: "This blood request is no longer accepting pledges." });
    }
    if (!donorBloodType || !pledgedQuantity || Number(pledgedQuantity) < 1) { // Ensure pledgedQuantity is a number
        return res.status(400).json({ message: "Missing required pledge information or invalid quantity." });
    }

    const newPledge = new DonationPledge({
      bloodRequestId: requestId,
      donorUserId,
      donorName,
      donorContactPhone: finalDonorContactPhone,
      donorBloodType,
      pledgedQuantity: Number(pledgedQuantity),
      donationNotes,
      status: "Pledged", // Or "Donated" if pledges are considered immediate donations
    });

    console.log("Pledge object to be saved:", JSON.stringify(newPledge, null, 2));

    await newPledge.save();

    // --- START BADGE LOGIC ---
    // Update donor's donation count and check for new badges
    // This assumes a pledge immediately counts towards donation milestones.
    // In a real system, you might have a separate step to confirm the donation happened.
    
    // --- END BADGE LOGIC ---

    // Update the blood request's fulfilled quantity and status based on all active pledges
    const allPledgesForRequest = await DonationPledge.find({ bloodRequestId: requestId, status: { $ne: "Cancelled" } });
    const totalPledgedQuantity = allPledgesForRequest.reduce((sum, pledge) => sum + pledge.pledgedQuantity, 0);

    bloodRequest.quantityFulfilled = totalPledgedQuantity;

    if (bloodRequest.quantityFulfilled >= bloodRequest.quantityNeeded * 2) {
      bloodRequest.status = "Fulfilled";
    } else if (bloodRequest.quantityFulfilled >= bloodRequest.quantityNeeded) {
      bloodRequest.status = "Partially Fulfilled";
    } else if (bloodRequest.quantityFulfilled > 0) {
        bloodRequest.status = "Partially Fulfilled";
    } else if (bloodRequest.quantityFulfilled === 0 && bloodRequest.status !== "Open") {
       // If all pledges are cancelled and it wasn't already Open, revert to Open
       bloodRequest.status = "Open";
    }

    await bloodRequest.save();

    // TODO: Notify staff about the new pledge and potential request status change via WebSocket
    // if (req.io) {
    //   req.io.to('staff-room').emit('pledgeUpdate', { pledge: newPledge, request: bloodRequest });
    // }

    res.status(201).json({ message: "Donation pledged successfully!", pledge: newPledge, updatedRequest: bloodRequest });

  } catch (error) {
    console.error("Error pledging donation:", error);
    if (error.name === "ValidationError") {
      console.error("Mongoose Validation Errors:", JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error pledging donation.", error: error.message });
  }
});

// == GET /api/blood-requests/:requestId/pledges ==
// Get all pledges for a specific blood request (for staff/admin view)
// Medical staff updates the status of a specific pledge (e.g., confirm donation)
router.put("/pledges/:pledgeId/status", authenticateToken, authorizeDoctorNurse, async (req, res) => {
  console.log(`--- Update Pledge Status Request for Pledge ID: ${req.params.pledgeId} ---`);
  try {
    const { pledgeId } = req.params;
    const { status: newStatus, staffNotes } = req.body; // Optional: staff can add notes to the pledge update

    if (!mongoose.Types.ObjectId.isValid(pledgeId)) {
      return res.status(400).json({ message: "Invalid pledge ID." });
    }

    const validStatuses = ["Pledged", "Scheduled", "Donated", "Cancelled"];
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status provided." });
    }

    const pledgeToUpdate = await DonationPledge.findById(pledgeId);
    if (!pledgeToUpdate) {
      return res.status(404).json({ message: "Donation pledge not found." });
    }

    const oldStatus = pledgeToUpdate.status;
    pledgeToUpdate.status = newStatus;
    if (staffNotes) {
      pledgeToUpdate.donationNotes = pledgeToUpdate.donationNotes
        ? `${pledgeToUpdate.donationNotes}\nStaff Note (${new Date().toLocaleDateString()}): ${staffNotes}`
        : `Staff Note (${new Date().toLocaleDateString()}): ${staffNotes}`;
    }

    await pledgeToUpdate.save();
    console.log(`Pledge ${pledgeId} status updated to ${newStatus} by ${req.user.username}`);

    // --- BADGE AND BLOOD REQUEST UPDATE LOGIC (MOVED HERE) ---
    if (newStatus === "Donated" && oldStatus !== "Donated") { // Only trigger if newly marked as Donated
      // Update donor's donation count
      const donorToUpdate = await User.findById(pledgeToUpdate.donorUserId);
      if (donorToUpdate) {
        donorToUpdate.donationCount = (donorToUpdate.donationCount || 0) + 1; // Increment by 1 for the act of donation

        const currentUnlockedBadges = donorToUpdate.unlockedBadges || [];
        const newlyUnlockedBadges = [];
        if (donorToUpdate.donationCount >= 2 && !currentUnlockedBadges.includes("beginner")) newlyUnlockedBadges.push("beginner");
        if (donorToUpdate.donationCount >= 5 && !currentUnlockedBadges.includes("committed")) newlyUnlockedBadges.push("committed");
        if (donorToUpdate.donationCount >= 10 && !currentUnlockedBadges.includes("heroic")) newlyUnlockedBadges.push("heroic");
        if (donorToUpdate.donationCount >= 20 && !currentUnlockedBadges.includes("legendary")) newlyUnlockedBadges.push("legendary");

        if (newlyUnlockedBadges.length > 0) {
          donorToUpdate.unlockedBadges.push(...newlyUnlockedBadges);
           // TODO: Notify user about new badge
           // if(req.io) req.io.to(`user_${donorToUpdate._id}`).emit('newBadgeUnlocked', { badges: newlyUnlockedBadges, totalDonations: donorToUpdate.donationCount });
        }
        await donorToUpdate.save();
        console.log(`User ${donorToUpdate.username} donation act count updated to ${donorToUpdate.donationCount}`);
      }

      // Update the associated BloodRequest's quantityFulfilled
      const bloodRequest = await BloodRequest.findById(pledgeToUpdate.bloodRequestId);
      if (bloodRequest) {
        // Recalculate based on ALL "Donated" pledges for this request
        const donatedPledges = await DonationPledge.find({
          bloodRequestId: pledgeToUpdate.bloodRequestId,
          status: "Donated"
        });
        const totalDonatedQuantity = donatedPledges.reduce((sum, p) => sum + p.pledgedQuantity, 0);
        
        bloodRequest.quantityFulfilled = totalDonatedQuantity; // Now this reflects actual donated units

        // Update status of BloodRequest based on actual donations
        if (bloodRequest.quantityFulfilled >= bloodRequest.quantityNeeded) { // Changed from *2 to just needed quantity
          bloodRequest.status = "Fulfilled";
        } else if (bloodRequest.quantityFulfilled > 0) {
          bloodRequest.status = "Partially Fulfilled";
        } else {
          // If donations are cancelled and it goes to 0, revert to Open
          if (bloodRequest.status !== "Cancelled" && bloodRequest.status !== "Closed") {
            bloodRequest.status = "Open";
          }
        }
        await bloodRequest.save();
        console.log(`BloodRequest ${bloodRequest._id} quantityFulfilled updated to ${bloodRequest.quantityFulfilled}, status to ${bloodRequest.status}`);
        // TODO: Notify relevant parties about BloodRequest update
        // if (req.io) req.io.to('staff-room').emit('bloodRequestUpdated', bloodRequest);
      }
    } else if (oldStatus === "Donated" && newStatus !== "Donated") {
      // If a donation was revered (e.g., marked as Cancelled after being Donated)
      // Decrement donation count and potentially remove badges (more complex, handle carefully)
      // And recalculate bloodRequest.quantityFulfilled
      // This part needs careful consideration of your business logic for reversals.
       const donorToUpdate = await User.findById(pledgeToUpdate.donorUserId);
        if (donorToUpdate) {
            donorToUpdate.donationCount = Math.max(0, (donorToUpdate.donationCount || 0) - 1); // Decrement act count
            // Badge removal logic would be more complex here. For now, just decrement count.
            await donorToUpdate.save();
        }
        const bloodRequest = await BloodRequest.findById(pledgeToUpdate.bloodRequestId);
        if (bloodRequest) {
            const donatedPledges = await DonationPledge.find({ bloodRequestId: pledgeToUpdate.bloodRequestId, status: "Donated" });
            const totalDonatedQuantity = donatedPledges.reduce((sum, p) => sum + p.pledgedQuantity, 0);
            bloodRequest.quantityFulfilled = totalDonatedQuantity;
            // Re-evaluate status
            if (bloodRequest.quantityFulfilled >= bloodRequest.quantityNeeded) bloodRequest.status = "Fulfilled";
            else if (bloodRequest.quantityFulfilled > 0) bloodRequest.status = "Partially Fulfilled";
            else if (bloodRequest.status !== "Cancelled" && bloodRequest.status !== "Closed") bloodRequest.status = "Open";
            await bloodRequest.save();
        }
    }


    const updatedPledge = await DonationPledge.findById(pledgeId)
        .populate("donorUserId", "username email"); // Send back populated pledge

    res.status(200).json({ message: "Pledge status updated successfully.", pledge: updatedPledge });

  } catch (error) {
    console.error("Error updating pledge status:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Validation Error", errors: error.errors });
    }
    res.status(500).json({ message: "Server error updating pledge status.", error: error.message });
  }
});


// GET /api/blood-requests/:requestId/pledges
// (This route remains the same as provided before)
router.get("/:requestId/pledges", authenticateToken, authorizeMedicalStaff, async (req, res) => {
    try {
        const { requestId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({ message: "Invalid blood request ID." });
        }

        const pledges = await DonationPledge.find({ bloodRequestId: requestId })
            .populate("donorUserId", "username email")
            .sort({ createdAt: -1 });

        if (!pledges) { // Should return empty array if no pledges, not null
            return res.status(200).json([]);
        }
        res.status(200).json(pledges);
    } catch (error) {
        console.error("Error fetching pledges:", error);
        res.status(500).json({ message: "Server error fetching pledges.", error: error.message });
    }
});

export default router;