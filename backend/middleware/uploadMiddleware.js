import multer from "multer";
import path from "path";

// Configuration de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Dossier où enregistrer les images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Nom unique
  },
});

const upload = multer({ storage: storage });

export default upload;
