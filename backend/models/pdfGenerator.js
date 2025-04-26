// backend/utils/pdfGenerator.js
import pdf from 'html-pdf-node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const generateMedicalRecordPDF = async (medicalRecord, patientFiles) => {
  const templatePath = path.join(__dirname, '../templates/medicalRecordTemplate.html');
  let template = fs.readFileSync(templatePath, 'utf8');

  // Formatage des données pour le template
  const patientName = `${medicalRecord.patientId?.firstName} ${medicalRecord.patientId?.lastName}`;
  const birthDate = new Date(medicalRecord.patientId?.dateOfBirth).toLocaleDateString('fr-FR');
  
  // Remplacement des placeholders dans le template
  template = template
    .replace('{{patientName}}', patientName)
    .replace('{{birthDate}}', birthDate)
    .replace('{{bloodType}}', medicalRecord.bloodType || 'Non spécifié')
    .replace('{{accessCode}}', medicalRecord.accessCode);

  // Génération des fichiers médicaux
  let filesHtml = '';
  patientFiles.forEach(file => {
    filesHtml += `
      <div class="file-section">
        <h3>${file.type}</h3>
        <p>Créé le: ${new Date(file.createdAt).toLocaleDateString('fr-FR')}</p>
        ${file.notes ? `<p>Notes: ${file.notes}</p>` : ''}
      </div>
      <hr>
    `;
  });
  template = template.replace('{{files}}', filesHtml);

  const options = { format: 'A4' };
  const buffer = await new Promise((resolve, reject) => {
    pdf.generatePdf({ content: template }, options, (err, buffer) => {
      if (err) reject(err);
      else resolve(buffer);
    });
  });

  return buffer;
};