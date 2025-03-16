import express from "express";
import { IncomingForm } from "formidable"; // ES Module import
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import fs from "fs";
import FormData from "form-data"; // Import form-data package

const router = express.Router();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback import for CommonJS compatibility (if ES Module import fails)
let IncomingFormInstance;
try {
  IncomingFormInstance = IncomingForm;
} catch (e) {
  console.error("ES Module import for formidable failed, attempting CommonJS fallback:", e);
  const formidable = require("formidable");
  IncomingFormInstance = formidable.IncomingForm;
}

router.post("/chatbot", (req, res) => {
  const form = new IncomingFormInstance({
    uploadDir: path.join(__dirname, "../uploads"),
    keepExtensions: true,
    multiples: false, // Handle single file upload
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ message: "Error uploading file", error: err.message });
    }

    const query = fields.query?.[0];
    const image = files.image?.[0];

    if (!query || !image) {
      return res.status(400).json({ message: "Query and image are required" });
    }

    const imagePath = image.filepath;

    // Verify the file exists before proceeding
    if (!fs.existsSync(imagePath)) {
      console.error(`File not found: ${imagePath}`);
      return res.status(500).json({ message: "Uploaded file not found", error: "ENOENT" });
    }

    try {
      const formData = new FormData(); // Use form-data package
      formData.append("image", fs.createReadStream(imagePath));
      formData.append("query", query);

      console.log("Sending request to FastAPI server at http://localhost:8000/upload_and_query...");
      const response = await axios.post("http://localhost:8000/upload_and_query", formData, {
        headers: {
          ...formData.getHeaders(), // Now works with form-data package
        },
        timeout: 30000, // 30 seconds timeout
      });

      console.log("Received response from FastAPI:", response.data);

      // Clean up the uploaded file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error processing request:", error.message);
      if (error.code === "ECONNREFUSED") {
        return res.status(503).json({ message: "FastAPI server is not running on http://localhost:8000" });
      } else if (error.response) {
        console.error("FastAPI server error:", error.response.data);
        return res.status(error.response.status).json({ message: "Error from FastAPI server", error: error.response.data });
      }
      // Clean up the uploaded file even if there's an error
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      res.status(500).json({ message: "Error processing request", error: error.message });
    }
  });
});

export default router;