import pdf from "html-pdf-node"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import Handlebars from "handlebars"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Fonction pour formater une date
const formatDate = (dateString) => {
  if (!dateString) return "Non spécifié"
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Enregistrer les helpers Handlebars
Handlebars.registerHelper("if", function (conditional, options) {
  if (conditional) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

Handlebars.registerHelper("unless", function (conditional, options) {
  if (!conditional) {
    return options.fn(this)
  } else {
    return options.inverse(this)
  }
})

Handlebars.registerHelper("each", (context, options) => {
  let ret = ""

  for (let i = 0, j = context.length; i < j; i++) {
    // Ajouter une propriété @index et @last
    context[i]["@index"] = i
    context[i]["@last"] = i === context.length - 1
    ret = ret + options.fn(context[i])
  }

  return ret
})

export const generateMedicalRecordPDF = async (medicalRecord, patientFiles) => {
  const templatePath = path.join(__dirname, "../../backend/templates/medicalRecordTemplate.html")
  const logoPath = path.join(__dirname, "../../backend/utils/logo1.png")

  // Formatage des données
  const currentDate = formatDate(new Date())

  // Lire le logo et le convertir en base64
  const logoBuffer = fs.readFileSync(logoPath)
  const base64Logo = logoBuffer.toString("base64")
  const logoDataURI = `data:image/png;base64,${base64Logo}`

  // Préparer les fichiers avec des dates formatées
  const formattedFiles = patientFiles.map((file) => {
    // Créer une copie profonde du fichier pour éviter de modifier l'original
    const formattedFile = JSON.parse(JSON.stringify(file))

    // Formater la date d'enregistrement
    formattedFile.dateFormatted = formatDate(file.dateRecorded)

    // Formater les dates dans les tests diagnostiques
    if (file.details?.diagnosticTests?.length > 0) {
      formattedFile.details.diagnosticTests.forEach((test) => {
        test.dateFormatted = formatDate(test.date)
      })
    }

    // Formater les dates dans les procédures
    if (file.details?.procedures?.length > 0) {
      formattedFile.details.procedures.forEach((procedure) => {
        procedure.dateFormatted = formatDate(procedure.date)
      })
    }

    // Formater la date de suivi
    if (file.details?.followUpDate) {
      formattedFile.details.followUpDateFormatted = formatDate(file.details.followUpDate)
    }

    return formattedFile
  })

  // Préparer les données pour le template
  const templateData = {
    logo: logoDataURI,
    patientName: `${medicalRecord.patientId?.firstName || ""} ${medicalRecord.patientId?.lastName || ""}`,
    birthDate: formatDate(medicalRecord.patientId?.dateOfBirth),
    gender: medicalRecord.patientId?.gender || "Non spécifié",
    phoneNumber: medicalRecord.patientId?.phoneNumber || "Non spécifié",
    email: medicalRecord.patientId?.email || "Non spécifié",
    bloodType: medicalRecord.bloodType || "Non spécifié",
    accessCode: medicalRecord.accessCode,
    currentDate: currentDate,
    allergies: medicalRecord.knownAllergies?.map(allergy => ({ name: allergy })) || null,
    chronicConditions: medicalRecord.chronicConditions?.map(condition => ({ name: condition })) || null,
    medications: medicalRecord.currentMedications?.map(med => ({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency
    })) || null,
        emergencyContact: medicalRecord.emergencyContact || null,
    files: formattedFiles,
  }

  // Lire le template
  const templateSource = fs.readFileSync(templatePath, "utf8")

  // Compiler le template avec Handlebars
  const template = Handlebars.compile(templateSource)

  // Générer le HTML final
  const html = template(templateData)

  const options = {
    format: "A4",
    printBackground: true,
    margin: {
      top: "10mm",
      right: "10mm",
      bottom: "10mm",
      left: "10mm",
    },
    displayHeaderFooter: false,
  }

  return new Promise((resolve, reject) => {
    pdf.generatePdf({ content: html }, options, (err, buffer) => {
      if (err) reject(err)
      else resolve(buffer)
    })
  })
}
