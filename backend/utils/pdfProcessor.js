// utils/pdfProcessor.js
import fs from 'fs-extra';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { exec } from 'child_process';
import util from 'util';
import sharp from 'sharp';

const execPromise = util.promisify(exec);

export const convertPDFToImages = async (pdfPath) => {
  try {
    const outputDir = path.join(path.dirname(pdfPath), 'temp_images');
    await fs.ensureDir(outputDir); // Créer le dossier temporaire
    
    // Utiliser le chemin absolu pour Ghostscript
    const absolutePdfPath = path.resolve(pdfPath);
    
    const { stdout, stderr } = await execPromise(
      `gs -dNOPAUSE -sDEVICE=png16m -r300 -sOutputFile="${path.join(outputDir, 'page-%d.png')}" "${absolutePdfPath}" -dBATCH`
    );


    const files = await fs.readdir(tempDir);
    const imagePaths = files
      .filter(file => file.endsWith('.png'))
      .map(file => path.join(tempDir, file))
      .sort();

    // Optimiser les images pour l'OCR
    const optimizedImages = [];
    for (const imgPath of imagePaths) {
      const optimizedPath = imgPath.replace('.png', '-optimized.png');
      await sharp(imgPath)
        .normalize()  // Améliore le contraste
        .linear(1.1, -(128 * 0.1))  // Ajuste la luminosité
        .threshold(128, { grayscale: true })  // Binarisation pour certains documents
        .toFile(optimizedPath);
      optimizedImages.push(optimizedPath);
    }

    return optimizedImages;
  } catch (error) {
    console.error('Erreur lors de la conversion PDF en images:', error);
    throw error;
  }
};