const Tesseract = require('tesseract.js');
const { createWorker } = Tesseract;

const processOCR = async (imageFile) => {
    const worker = await createWorker({
        logger: m => console.log(m) // Optionnel: logging
    });
    
    try {
        await worker.loadLanguage('fra');
        await worker.initialize('fra');
        
        const { data: { text } } = await worker.recognize(imageFile.data);
        return { 
            success: true,
            text: cleanOCRText(text),
            file: imageFile.name
        };
    } finally {
        await worker.terminate();
    }
};

// Nettoyage du texte
const cleanOCRText = (text) => {
    return text
        .replace(/(\r\n|\n|\r)/gm, " ") // Retours à la ligne
        .replace(/\s+/g, ' ') // Espaces multiples
        .trim();
};

module.exports = { processOCR };