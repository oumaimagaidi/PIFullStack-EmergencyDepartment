import { createWorker } from 'tesseract.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractMedicalData } from '../utils/textParser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesUploadDir = path.resolve(__dirname, '../../../uploads/images');
const tessdataDir = path.resolve(__dirname, '../../../tessdata');
const tesscacheDir = path.resolve(__dirname, '../../../tesscache');

const verifyEnvironment = async () => {
    try {
        const requiredDirs = [
            imagesUploadDir,
            tessdataDir
        ];

        for (const dir of requiredDirs) {
            await fs.ensureDir(dir);
        }

        return true;
    } catch (error) {
        throw new Error(`Erreur de configuration: ${error.message}`);
    }
};

export const processImage = async (imagePath, medicalRecordId) => {
    let worker = null;

    try {
        // Vérification de l'existence du fichier image
        await fs.access(imagePath, fs.constants.R_OK);

        await verifyEnvironment();

        worker = await createWorker({
            cachePath: tesscacheDir,
            logger: m => console.log('[TESSERACT]', m),
            errorHandler: err => console.error('[TESSERACT ERROR]', err),
            tessdataDir: tessdataDir
        });

        await worker.loadLanguage('fra+eng');
        await worker.initialize('fra+eng');

        await worker.setParameters({
            tessedit_pageseg_mode: '6', // Mode traitement de bloc unique (adapter si nécessaire)
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÉÈÊËÀÂÄÎÏÔÖÙÛÜÇéèêëàâäîïôöùûüç0123456789-/,.:;()\'" ',
            preserve_interword_spaces: '1'
        });

        const extractionStartTime = Date.now();

        const { data } = await worker.recognize(imagePath, {
            rotateAuto: true,
            pdfTitle: "Image" // Le titre PDF n'est plus pertinent ici
        });

        const fullText = data.text;

        console.log(`OCR complété en ${((Date.now() - extractionStartTime) / 1000).toFixed(1)}s`);

        const extractedData = extractMedicalData(fullText); // Tu peux adapter cette fonction si nécessaire pour des images

        return {
            success: true,
            data: {
                text: fullText,
                extractedData: extractedData // Les données extraites dépendront du contenu de l'image
            }
        };

    } catch (error) {
        console.error('Erreur de traitement OCR sur image:', {
            error: error.message,
            imagePath,
            stack: error.stack
        });
        throw new Error(`Échec du traitement OCR sur image: ${error.message}`);
    } finally {
        if (worker) {
            await worker.terminate();
        }
    }
};