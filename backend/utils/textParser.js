// utils/textParser.js
export const extractMedicalData = (text) => {
  const result = {
    patientName: '',
    diagnosis: '',
    tests: [],
    treatments: []
  };

  // Extraire le nom du patient
  const nameMatch = text.match(/Nom et prénom:\s*(.+)/i);
  if (nameMatch) {
    result.patientName = nameMatch[1].trim();
  }

  // Extraire le diagnostic
  const diagnosisMatch = text.match(/DIAGNOSTIQUE\s*([^\n]+)/i);
  if (diagnosisMatch) {
    result.diagnosis = diagnosisMatch[1].trim();
  }

  // Extraire les résultats de test
  const resultMatch = text.match(/RESULTAT\s*([^\n]+)/i);
  if (resultMatch) {
    result.tests.push({
      testName: 'Résultats diagnostiques',
      result: resultMatch[1].trim(),
      date: new Date()
    });
  }

  return result;
};