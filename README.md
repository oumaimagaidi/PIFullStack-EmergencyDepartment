# Emergency Department Management System

[![GitHub Branches](https://img.shields.io/badge/branches-multiple-blue)](https://github.com/oumaimagaidi/PIFullStack-EmergencyDepartment/branches)
[![MERN Stack](https://img.shields.io/badge/stack-MERN-brightgreen)](https://www.mongodb.com/mern-stack)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%20Partial-yellow)](https://www.w3.org/WAI/standards-guidelines/wcag/) <!-- Ajout d'un badge accessibilité -->

## Project Overview 🚨
A comprehensive system for managing emergency department operations, aiming to improve efficiency, communication, and patient care outcomes. This system covers patient registration and tracking, medical record management with advanced features, ambulance dispatch and coordination, staff management, and includes dedicated accessibility features for a more inclusive user experience.

## Technology Stack 🚀

### MERN Architecture
**M**ongoDB | **E**xpress.js | **R**eact | **N**ode.js

#### Frontend
- **React**: Component-based UI with dynamic rendering
- **React Router**: Declarative navigation
- **Shadcn UI (Radix UI)**: Accessible and customizable UI components
- **Sonner**: Beautiful and accessible toast notifications
- **Socket.io-client**: Real-time communication for live updates (tracking, notifications)
- **Axios**: Promise-based HTTP client for API communication
- **Leaflet & React-Leaflet**: Interactive maps for location tracking and visualization
- **Framer Motion**: Animations and transitions for enhanced user experience
- **React Hook Form & Zod**: Robust form management and validation
- **react-google-recaptcha**: Bot prevention on forms
- **Date-fns**: Efficient date manipulation
- **js-cookie**: Browser cookie management
- **Tsparticles**: Particle effects for background visuals

#### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Fast, minimalist web application framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **JWT**: JSON Web Tokens for secure API authentication
- **Bcrypt**: Password hashing for user security
- **Socket.io**: Real-time bidirectional event-based communication
- **Tesseract.js**: OCR engine for text extraction from images/PDFs
- **@huggingface/inference / @xenova/transformers**: Integration with Hugging Face models for AI/NLP tasks (symptom analysis, QA)
- **Nodemailer**: Email sending (for OTP, password reset, notifications)
- **Twilio**: SMS sending for phone notifications
- **libphonenumber-js**: Robust phone number parsing and validation
- **Html-pdf-node / Puppeteer**: PDF generation from HTML templates
- **Cors, Cookie-parser, Dotenv, Multer, etc.**: Essential middleware and environment management tools.


## Key Features ✨

### Accessibility Features ♿
*   **Text-to-Speech (TTS) on Interaction:** Provides vocal feedback by reading out the text content or accessible labels of interactive elements (buttons, links, form fields) and important content on hover and focus events.
*   **Configurable TTS Language:** Users can select their preferred language for vocal output from a list of available voices detected in their browser/system.
    *   **User Story:** As a visually impaired user, I want the website to read out the text of interactive elements when I hover over or focus them, so that I can easily understand and navigate the content without relying solely on sight.

### Electronic Medical Records (EMR) & Documents 📄
*   Secure creation, viewing, and updating of EMRs for emergency patients.
*   Comprehensive **Patient File** system allowing the creation and management of various document types specific to emergency care (Triage, Diagnostic, Treatment, Vital Signs, Discharge, Patient Information, Prescription).
*   **Optical Character Recognition (OCR):** Ability to upload medical images (like scanned reports or handwritten notes) and extract text to automatically populate fields in new patient files (e.g., Diagnosis, Test Results).
*   **Medical Record Sharing:** Authorized staff (Doctors) can securely share specific patient records with other authorized team members within the system.
*   **File Archiving:** Provides functionality to archive older or less relevant patient files, maintaining a clean primary record while keeping historical data accessible in an archive section.
*   Generation of comprehensive Medical Records as **PDF documents** for easy sharing and printing.
*   Doctors can easily consult **all medical records of their assigned patients**.

### Emergency Patient Management 🚨
*   Intuitive patient **registration portal** for emergency cases.
*   **Real-time status tracking** interface allowing patients/guardians to monitor their request progress (e.g., Registered, Under Review, Doctor Assigned, En Route, Treated).
*   **Estimated Wait Time (ETA) Calculation:** Provides patients with a dynamically estimated waiting time based on current department load and staffing.
*   **Automated Doctor Assignment:** System logic to automatically assign available doctors to new or waiting emergency cases.
*   Medical dossier **access codes** providing a secure method for patients/guardians to access limited information about their medical record status or documents.
*   **SMS Notifications:** Patients can receive key status updates via SMS if a phone number is provided during registration.
*   **AI Symptom Analysis:** Basic AI integration during registration to analyze the patient's description of symptoms, providing suggested keywords and clarifying questions to improve information quality.

### Ambulance Coordination & Tracking 🚑
*   Live **ambulance location tracking** displayed on an interactive map interface for both staff and patients.
*   Patient-initiated **ambulance requests** via the application.
*   Staff interface for **ambulance dispatch and management**, including status updates (Available, On Mission, Maintenance) and team assignment.
*   Real-time **ETA calculations** and route visualization from the ambulance's current location to the patient's pickup location.
*   Staff dashboards provide a clear overview of **ambulance availability** and ongoing missions.

### Staff & Administration Management 👨‍⚕️👩‍⚕️
*   Comprehensive **Staff Directory** listing all medical and administrative personnel with key contact information and roles.
*   **User Statistics and Analytics:** Dashboard views providing insights into user distribution by role, total patients, emergency case trends, etc.
*   **Resource Inventory Management:** System for tracking and managing hospital resources (beds, equipment), including location and status (available, in maintenance).
*   Ability for authorized staff (Admins, Nurses) to **allocate resources to specific patients**.
*   Real-time **Notifications System** for staff alerts regarding patient status changes, doctor assignments, new emergency cases, ambulance alerts, etc.
*   Staff **AI Chat Assistant:** An integrated chatbot allowing medical staff to query patient data, resource availability, etc., using natural language, providing quick, contextual information retrieval.
*   Internal Medical **Forum** for staff to discuss cases, protocols, and share information securely.
*   Staff account **validation and role management** (primarily for Administrators).

## Team Members & Branches 👥

| Member                | Role                          | Focus Areas                                                    | Branch Link                                                                 |
|-----------------------|-------------------------------|----------------------------------------------------------------|-----------------------------------------------------------------------------|
| Emna Ouerghemmi       | EMR Specialist                | Medical Records, Patient Files, OCR, Sharing, Archiving, Dashboard Views, Statistics, Resource Management, Staff Directory          | [profile](https://github.com/oumaimagaidi/PIFullStack-EmergencyDepartment/tree/profile) |
| Oumaima Gaidi         | Patient Flow & Registration   | Emergency Patient Reg./Tracking, Wait Time, Patient Experience, Dashboard Views, Statistics, Resource Management, Staff Directory | [profile](https://github.com/oumaimagaidi/PIFullStack-EmergencyDepartment/tree/profile) |
| Ahmed N. A. Mejri     | Ambulance Coordinator         | Ambulance Request/Tracking, Location Services, Dispatch        | [ambulance-check](https://github.com/oumaimagaidi/PIFullStack-EmergencyDepartment/tree/dashboard) |
| *Collaboration*       | Accessibility & Integrations/ Dashboard & Analytics    | TTS, Notifications, Chatbot, Cross-Module Integrations         | *(Across multiple branches)*                                                |


## Getting Started 🚦
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/oumaimagaidi/PIFullStack-EmergencyDepartment.git
    cd PIFullStack-EmergencyDepartment
    ```
2.  **Set up the Backend:**
    *   Navigate to the backend directory: `cd backend`
    *   Install dependencies: `npm install` or `yarn install`
    *   **Crucial:** Create a `.env` file in the `backend` directory based on the example (if any) and configure your **MongoDB URI**, **JWT Secret**, and **API keys** for **Twilio**, **OpenAI**, and **Hugging Face** (HF_ACCESS_TOKEN, potentially HF_QA_MODEL). Ensure `PORT` is set to `8089`.
    *   Start the backend server: `npm run dev` or `yarn dev`
    *   **Check Backend Logs:** Verify that MongoDB connects successfully and the server starts listening on port 8089.
3.  **Set up the Frontend:**
    *   Navigate back to the root directory, then to the frontend directory: `cd ../frontend`
    *   Install dependencies: `npm install` or `yarn install`
    *   **Crucial:** Create a `.env` file in the `frontend` directory based on the example (if any) and configure your backend API URL (`VITE_API_URL=http://localhost:8089`) and any other necessary keys (e.g., VITE_RECAPTCHA_SITE_KEY if used).
    *   Start the frontend development server: `npm run dev` or `yarn dev`
4.  **Access the Application:** Open your browser to `http://localhost:3000` (or the port specified by your frontend Vite config).
5.  **Ensure MongoDB is running:** Make sure your MongoDB server is running and accessible at the URI specified in the backend's `.env`.
6.  **Check Browser Console:** Look for any `ERR_CONNECTION_REFUSED` or other errors indicating the frontend cannot reach the backend.
