"use client"

import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

const AddPatientFileModal = ({ medicalRecordId, initialData, onClose, onSubmit }) => {
  const [fileData, setFileData] = useState({
    type: "",
    notes: "",
    details: {},
  })

  useEffect(() => {
    if (initialData) {
      setFileData(initialData)
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFileData({ ...fileData, [name]: value })
  }

  const handleSelectChange = (name, value) => {
    setFileData({ ...fileData, [name]: value })
  }

  const handleDetailsChange = (e) => {
    const { name, value } = e.target
    setFileData({
      ...fileData,
      details: {
        ...fileData.details,
        [name]: value,
      },
    })
  }

  const handleNestedDetailsChange = (parent, field, value) => {
    setFileData({
      ...fileData,
      details: {
        ...fileData.details,
        [parent]: {
          ...(fileData.details[parent] || {}),
          [field]: value,
        },
      },
    })
  }

  const handleArrayItemChange = (arrayName, index, field, value) => {
    const array = [...(fileData.details[arrayName] || [])]
    array[index] = { ...array[index], [field]: value }

    setFileData({
      ...fileData,
      details: {
        ...fileData.details,
        [arrayName]: array,
      },
    })
  }

  const addArrayItem = (arrayName, template) => {
    const array = [...(fileData.details[arrayName] || [])]
    array.push(template)

    setFileData({
      ...fileData,
      details: {
        ...fileData.details,
        [arrayName]: array,
      },
    })
  }

  const removeArrayItem = (arrayName, index) => {
    const array = [...(fileData.details[arrayName] || [])]
    array.splice(index, 1)

    setFileData({
      ...fileData,
      details: {
        ...fileData.details,
        [arrayName]: array,
      },
    })
  }

  const renderTypeSpecificFields = () => {
    switch (fileData.type) {
      case "Prescription":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Médicaments</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("medications", { name: "", dosage: "", frequency: "", duration: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>
              {fileData.details.medications?.map((med, index) => (
                <Card key={index} className="mt-2">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm">Médicament {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => removeArrayItem("medications", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`med-name-${index}`} className="text-xs">
                          Nom
                        </Label>
                        <Input
                          id={`med-name-${index}`}
                          value={med.name || ""}
                          onChange={(e) => handleArrayItemChange("medications", index, "name", e.target.value)}
                          placeholder="Nom du médicament"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`med-dosage-${index}`} className="text-xs">
                          Dosage
                        </Label>
                        <Input
                          id={`med-dosage-${index}`}
                          value={med.dosage || ""}
                          onChange={(e) => handleArrayItemChange("medications", index, "dosage", e.target.value)}
                          placeholder="ex: 500mg"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`med-frequency-${index}`} className="text-xs">
                          Fréquence
                        </Label>
                        <Input
                          id={`med-frequency-${index}`}
                          value={med.frequency || ""}
                          onChange={(e) => handleArrayItemChange("medications", index, "frequency", e.target.value)}
                          placeholder="ex: 3 fois par jour"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`med-duration-${index}`} className="text-xs">
                          Durée
                        </Label>
                        <Input
                          id={`med-duration-${index}`}
                          value={med.duration || ""}
                          onChange={(e) => handleArrayItemChange("medications", index, "duration", e.target.value)}
                          placeholder="ex: 7 jours"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case "Diagnostic":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnostic</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={fileData.details.diagnosis || ""}
                onChange={handleDetailsChange}
                placeholder="Entrez le diagnostic"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tests diagnostiques</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("diagnosticTests", { testName: "", result: "", date: new Date() })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>
              {fileData.details.diagnosticTests?.map((test, index) => (
                <Card key={index} className="mt-2">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm">Test {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => removeArrayItem("diagnosticTests", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`test-name-${index}`} className="text-xs">
                          Nom du test
                        </Label>
                        <Input
                          id={`test-name-${index}`}
                          value={test.testName || ""}
                          onChange={(e) => handleArrayItemChange("diagnosticTests", index, "testName", e.target.value)}
                          placeholder="Nom du test"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`test-result-${index}`} className="text-xs">
                          Résultat
                        </Label>
                        <Input
                          id={`test-result-${index}`}
                          value={test.result || ""}
                          onChange={(e) => handleArrayItemChange("diagnosticTests", index, "result", e.target.value)}
                          placeholder="Résultat"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <Label htmlFor={`test-date-${index}`} className="text-xs">
                          Date
                        </Label>
                        <Input
                          id={`test-date-${index}`}
                          type="date"
                          value={test.date ? new Date(test.date).toISOString().split("T")[0] : ""}
                          onChange={(e) =>
                            handleArrayItemChange("diagnosticTests", index, "date", new Date(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case "Treatment":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Procédures</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("procedures", { name: "", date: new Date(), notes: "" })}
                >
                  <Plus className="h-4 w-4 mr-1" /> Ajouter
                </Button>
              </div>
              {fileData.details.procedures?.map((proc, index) => (
                <Card key={index} className="mt-2">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-sm">Procédure {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500"
                        onClick={() => removeArrayItem("procedures", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`proc-name-${index}`} className="text-xs">
                          Nom de la procédure
                        </Label>
                        <Input
                          id={`proc-name-${index}`}
                          value={proc.name || ""}
                          onChange={(e) => handleArrayItemChange("procedures", index, "name", e.target.value)}
                          placeholder="Nom de la procédure"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`proc-date-${index}`} className="text-xs">
                          Date
                        </Label>
                        <Input
                          id={`proc-date-${index}`}
                          type="date"
                          value={proc.date ? new Date(proc.date).toISOString().split("T")[0] : ""}
                          onChange={(e) => handleArrayItemChange("procedures", index, "date", new Date(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`proc-notes-${index}`} className="text-xs">
                          Notes
                        </Label>
                        <Textarea
                          id={`proc-notes-${index}`}
                          value={proc.notes || ""}
                          onChange={(e) => handleArrayItemChange("procedures", index, "notes", e.target.value)}
                          placeholder="Notes sur la procédure"
                          rows={2}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case "VitalSigns":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="temperature">Température (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={fileData.details.vitalSigns?.temperature || ""}
                  onChange={(e) =>
                    handleNestedDetailsChange("vitalSigns", "temperature", Number.parseFloat(e.target.value) || "")
                  }
                  placeholder="ex: 37.2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartRate">Rythme cardiaque (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={fileData.details.vitalSigns?.heartRate || ""}
                  onChange={(e) =>
                    handleNestedDetailsChange("vitalSigns", "heartRate", Number.parseInt(e.target.value) || "")
                  }
                  placeholder="ex: 72"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systolic">Pression artérielle (systolique)</Label>
                <Input
                  id="systolic"
                  type="number"
                  value={fileData.details.vitalSigns?.bloodPressure?.systolic || ""}
                  onChange={(e) =>
                    setFileData({
                      ...fileData,
                      details: {
                        ...fileData.details,
                        vitalSigns: {
                          ...(fileData.details.vitalSigns || {}),
                          bloodPressure: {
                            ...(fileData.details.vitalSigns?.bloodPressure || {}),
                            systolic: Number.parseInt(e.target.value) || "",
                          },
                        },
                      },
                    })
                  }
                  placeholder="ex: 120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Pression artérielle (diastolique)</Label>
                <Input
                  id="diastolic"
                  type="number"
                  value={fileData.details.vitalSigns?.bloodPressure?.diastolic || ""}
                  onChange={(e) =>
                    setFileData({
                      ...fileData,
                      details: {
                        ...fileData.details,
                        vitalSigns: {
                          ...(fileData.details.vitalSigns || {}),
                          bloodPressure: {
                            ...(fileData.details.vitalSigns?.bloodPressure || {}),
                            diastolic: Number.parseInt(e.target.value) || "",
                          },
                        },
                      },
                    })
                  }
                  placeholder="ex: 80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratoryRate">Fréquence respiratoire</Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  value={fileData.details.vitalSigns?.respiratoryRate || ""}
                  onChange={(e) =>
                    handleNestedDetailsChange("vitalSigns", "respiratoryRate", Number.parseInt(e.target.value) || "")
                  }
                  placeholder="ex: 16"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygenSaturation">Saturation en oxygène (%)</Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  value={fileData.details.vitalSigns?.oxygenSaturation || ""}
                  onChange={(e) =>
                    handleNestedDetailsChange("vitalSigns", "oxygenSaturation", Number.parseInt(e.target.value) || "")
                  }
                  placeholder="ex: 98"
                />
              </div>
            </div>
          </div>
        )

      case "Triage":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priorityLevel">Niveau de priorité</Label>
              <Select
                value={fileData.details.priorityLevel || ""}
                onValueChange={(value) => handleDetailsChange({ target: { name: "priorityLevel", value } })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Élevé">Élevé</SelectItem>
                  <SelectItem value="Moyen">Moyen</SelectItem>
                  <SelectItem value="Faible">Faible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Motif principal</Label>
              <Textarea
                id="chiefComplaint"
                name="chiefComplaint"
                value={fileData.details.chiefComplaint || ""}
                onChange={handleDetailsChange}
                placeholder="Motif principal de la consultation"
                rows={3}
              />
            </div>
          </div>
        )

      case "Discharge":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dischargeInstructions">Instructions de sortie</Label>
              <Textarea
                id="dischargeInstructions"
                name="dischargeInstructions"
                value={fileData.details.dischargeInstructions || ""}
                onChange={handleDetailsChange}
                placeholder="Instructions pour le patient"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followUpDate">Date de suivi</Label>
              <Input
                id="followUpDate"
                type="date"
                name="followUpDate"
                value={
                  fileData.details.followUpDate
                    ? new Date(fileData.details.followUpDate).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  handleDetailsChange({
                    target: { name: "followUpDate", value: e.target.value ? new Date(e.target.value) : "" },
                  })
                }
              />
            </div>
          </div>
        )

      case "PatientInformation":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={fileData.details.patientInfo?.firstName || ""}
                  onChange={(e) => handleNestedDetailsChange("patientInfo", "firstName", e.target.value)}
                  placeholder="Prénom du patient"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={fileData.details.patientInfo?.lastName || ""}
                  onChange={(e) => handleNestedDetailsChange("patientInfo", "lastName", e.target.value)}
                  placeholder="Nom du patient"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentSymptoms">Symptômes actuels</Label>
              <Textarea
                id="currentSymptoms"
                value={fileData.details.patientInfo?.currentSymptoms || ""}
                onChange={(e) => handleNestedDetailsChange("patientInfo", "currentSymptoms", e.target.value)}
                placeholder="Symptômes actuels du patient"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="painLevel">Niveau de douleur (0-10)</Label>
              <Input
                id="painLevel"
                type="number"
                min="0"
                max="10"
                value={fileData.details.patientInfo?.painLevel || ""}
                onChange={(e) =>
                  handleNestedDetailsChange("patientInfo", "painLevel", Number.parseInt(e.target.value) || "")
                }
                placeholder="Niveau de douleur"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(fileData)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Modifier le document" : "Ajouter un nouveau document"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type de document</Label>
            <Select
              value={fileData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
              disabled={initialData}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prescription">Prescription</SelectItem>
                <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                <SelectItem value="Treatment">Traitement</SelectItem>
                <SelectItem value="VitalSigns">Signes vitaux</SelectItem>
                <SelectItem value="Triage">Triage</SelectItem>
                <SelectItem value="Discharge">Sortie</SelectItem>
                <SelectItem value="PatientInformation">Informations patient</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {fileData.type && renderTypeSpecificFields()}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes additionnelles</Label>
            <Textarea
              id="notes"
              name="notes"
              value={fileData.notes || ""}
              onChange={handleChange}
              placeholder="Notes additionnelles"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={!fileData.type}>
              {initialData ? "Mettre à jour" : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddPatientFileModal
