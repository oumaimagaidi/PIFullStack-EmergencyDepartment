import mongoose from "mongoose";

const options = { discriminatorKey: "role", timestamps: true };

// Définition du schéma de base User
const UserSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phoneNumber: { type: String, required: true },
		role: { type: String, required: true, enum: ["Patient", "Doctor", "Nurse", "Administrator"] },
		isValidated: { type: Boolean, default: false }, // Nouveau champ
		profileImage: { type: String },
		resetPasswordToken: String, // Nouveau champ
		resetPasswordExpires: Date, // Nouveau champ
		otp: { type: String, required: false, default: 0 },
		otpExpires: Date,
	},
	options
);
// Méthodes communes
UserSchema.methods.login = function () {
	console.log(`${this.username} logged in.`);
};

UserSchema.methods.logout = function () {
	console.log(`${this.username} logged out.`);
};

UserSchema.methods.updateProfile = function () {
	console.log(`${this.username} updated profile.`);
};

UserSchema.methods.resetPassword = function () {
	console.log(`${this.username} reset password.`);
};

const User = mongoose.model("User", UserSchema);

// ------------------- Patient -------------------
const PatientSchema = new mongoose.Schema({
	name: { type: String, required: true },
	dateOfBirth: { type: Date, required: true },
	gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
	address: { type: String, required: true },
	emergencyContact: { type: String, required: true },
	bloodType: { type: String, required: true },
	allergies: [{ type: String }],
});

PatientSchema.methods.registerPatient = function () {
	console.log(`Patient ${this.name} registered.`);
};

PatientSchema.methods.updatePatientInfo = function () {
	console.log(`Patient ${this.name} info updated.`);
};

PatientSchema.methods.viewMedicalHistory = function () {
	console.log(`Viewing medical history of ${this.name}.`);
};

const Patient = User.discriminator("Patient", PatientSchema);

// ------------------- Doctor -------------------
const DoctorSchema = new mongoose.Schema({
	badgeNumber: { type: String, required: true },
	specialization: { type: String, required: true },
	licenseNumber: { type: String, required: true },
	isAvailable: { type: Boolean, default: true }, // New field
});

DoctorSchema.methods.assignTreatment = function () {
	console.log(`Doctor ${this.username} assigned treatment.`);
};

DoctorSchema.methods.changePatientStatus = function () {
	console.log(`Doctor ${this.username} changed patient status.`);
};

DoctorSchema.methods.assignResources = function () {
	console.log(`Doctor ${this.username} assigned resources.`);
};

DoctorSchema.methods.prescribeMedication = function () {
	console.log(`Doctor ${this.username} prescribed medication.`);
};

DoctorSchema.methods.viewSchedule = function () {
	console.log(`Doctor ${this.username} viewing schedule.`);
};

const Doctor = User.discriminator("Doctor", DoctorSchema);

// ------------------- Nurse -------------------
const NurseSchema = new mongoose.Schema({
	badgeNumber: { type: String, required: true },
	shift: { type: String, required: true },
	licenseNumber: { type: String, required: true },
});

NurseSchema.methods.addMedicalNotes = function () {
	console.log(`Nurse ${this.username} added medical notes.`);
};

NurseSchema.methods.assignPatientPriority = function () {
	console.log(`Nurse ${this.username} assigned patient priority.`);
};

NurseSchema.methods.updatePatientAllocation = function () {
	console.log(`Nurse ${this.username} updated patient allocation.`);
};

NurseSchema.methods.administerMedication = function () {
	console.log(`Nurse ${this.username} administered medication.`);
};

NurseSchema.methods.viewSchedule = function () {
	console.log(`Nurse ${this.username} viewing schedule.`);
};

const Nurse = User.discriminator("Nurse", NurseSchema);

// ------------------- Administrator -------------------
const AdminSchema = new mongoose.Schema({
	badgeNumber: { type: String, required: true },
});

AdminSchema.methods.manageResources = function () {
	console.log(`Administrator ${this.username} managing resources.`);
};

AdminSchema.methods.allocateNurses = function () {
	console.log(`Administrator ${this.username} allocating nurses.`);
};

AdminSchema.methods.allocateDoctors = function () {
	console.log(`Administrator ${this.username} allocating doctors.`);
};

AdminSchema.methods.calculateResourceUtilization = function () {
	console.log(`Administrator ${this.username} calculating resource utilization.`);
};

const Administrator = User.discriminator("Administrator", AdminSchema);

export { User, Patient, Doctor, Nurse, Administrator };