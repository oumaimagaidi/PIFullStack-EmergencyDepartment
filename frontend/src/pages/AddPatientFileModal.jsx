"use client"

import { useState, useEffect } from "react"
import { X, Plus } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

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
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Medications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("medications", { name: "", dosage: "", frequency: "", duration: "" })}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <AnimatePresence>
                {fileData.details.medications?.map((med, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="mt-2 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">Medication {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 transition-all duration-200 hover:bg-red-50 hover:rotate-90"
                            onClick={() => removeArrayItem("medications", index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`med-name-${index}`} className="text-xs">
                              Name
                            </Label>
                            <Input
                              id={`med-name-${index}`}
                              value={med.name || ""}
                              onChange={(e) => handleArrayItemChange("medications", index, "name", e.target.value)}
                              placeholder="Medication name"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
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
                              placeholder="e.g., 500mg"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`med-frequency-${index}`} className="text-xs">
                              Frequency
                            </Label>
                            <Input
                              id={`med-frequency-${index}`}
                              value={med.frequency || ""}
                              onChange={(e) => handleArrayItemChange("medications", index, "frequency", e.target.value)}
                              placeholder="e.g., 3 times a day"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`med-duration-${index}`} className="text-xs">
                              Duration
                            </Label>
                            <Input
                              id={`med-duration-${index}`}
                              value={med.duration || ""}
                              onChange={(e) => handleArrayItemChange("medications", index, "duration", e.target.value)}
                              placeholder="e.g., 7 days"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )

      case "Diagnostic":
        return (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                name="diagnosis"
                value={fileData.details.diagnosis || ""}
                onChange={handleDetailsChange}
                placeholder="Enter diagnosis"
                rows={3}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Diagnostic Tests</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("diagnosticTests", { testName: "", result: "", date: new Date() })}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <AnimatePresence>
                {fileData.details.diagnosticTests?.map((test, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="mt-2 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">Test {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 transition-all duration-200 hover:bg-red-50 hover:rotate-90"
                            onClick={() => removeArrayItem("diagnosticTests", index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`test-name-${index}`} className="text-xs">
                              Test Name
                            </Label>
                            <Input
                              id={`test-name-${index}`}
                              value={test.testName || ""}
                              onChange={(e) => handleArrayItemChange("diagnosticTests", index, "testName", e.target.value)}
                              placeholder="Test name"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`test-result-${index}`} className="text-xs">
                              Result
                            </Label>
                            <Input
                              id={`test-result-${index}`}
                              value={test.result || ""}
                              onChange={(e) => handleArrayItemChange("diagnosticTests", index, "result", e.target.value)}
                              placeholder="Result"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
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
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )

      // Similar pattern for other case types with animations
      case "Treatment":
        return (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Treatment fields with animations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Procedures</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem("procedures", { name: "", date: new Date(), notes: "" })}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              <AnimatePresence>
                {fileData.details.procedures?.map((proc, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="mt-2 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-sm">Procedure {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-500 transition-all duration-200 hover:bg-red-50 hover:rotate-90"
                            onClick={() => removeArrayItem("procedures", index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`proc-name-${index}`} className="text-xs">
                              Procedure Name
                            </Label>
                            <Input
                              id={`proc-name-${index}`}
                              value={proc.name || ""}
                              onChange={(e) => handleArrayItemChange("procedures", index, "name", e.target.value)}
                              placeholder="Procedure name"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
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
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
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
                              placeholder="Notes about the procedure"
                              rows={2}
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )

      case "VitalSigns":
        return (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={fileData.details.vitalSigns?.temperature || ""}
                  onChange={(e) =>
                    handleNestedDetailsChange("vitalSigns", "temperature", Number.parseFloat(e.target.value) || "")
                  }
                  placeholder="e.g., 37.2"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={fileData.details.vitalSigns?.heartRate || ""}
                  onChange={(e) =>
                    handleNestedDetailsChange("vitalSigns", "heartRate", Number.parseInt(e.target.value) || "")
                  }
                  placeholder="e.g., 72"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systolic">Blood Pressure (systolic)</Label>
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
                  placeholder="e.g., 120"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diastolic">Blood Pressure (diastolic)</Label>
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
                  placeholder="e.g., 80"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratoryRate">Respiratory Rate</Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  value={fileData.details.vitalSigns?.respiratoryRate || ""}
                  onChange={(e) =>
                    handleNestedDetailsChange("vitalSigns", "respiratoryRate", Number.parseInt(e.target.value) || "")
                  }
                  placeholder="e.g., 16"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  value={fileData.details.vitalSigns?.oxygenSaturation || ""}
                  onChange={(e) =>
                    handleNestedDetailsChange("vitalSigns", "oxygenSaturation", Number.parseInt(e.target.value) || "")
                  }
                  placeholder="e.g., 98"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </motion.div>
        )

      // Other cases with similar animation patterns
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
          <DialogTitle>{initialData ? "Edit Document" : "Add New Document"}</DialogTitle>
        </DialogHeader>
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-2">
            <Label htmlFor="type">Document Type</Label>
            <Select
              value={fileData.type}
              onValueChange={(value) => handleSelectChange("type", value)}
              disabled={initialData}
            >
              <SelectTrigger className="transition-all duration-200 hover:border-blue-300">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Prescription">Prescription</SelectItem>
                <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                <SelectItem value="Treatment">Treatment</SelectItem>
                <SelectItem value="VitalSigns">Vital Signs</SelectItem>
                <SelectItem value="Triage">Triage</SelectItem>
                <SelectItem value="Discharge">Discharge</SelectItem>
                <SelectItem value="PatientInformation">Patient Information</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence mode="wait">
            {fileData.type && renderTypeSpecificFields()}
          </AnimatePresence>

          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={fileData.notes || ""}
              onChange={handleChange}
              placeholder="Additional notes"
              rows={3}
              className="transition-all duration-200 focus:ring-2 focus:ring-blue-200"
            />
          </motion.div>

          <motion.div 
            className="flex justify-end space-x-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="transition-all duration-200 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              className="bg-[#D1DEEB] text-gray-900 hover:bg-[#b8c9db] shadow-lg rounded-lg py-3 px-6 transition-all duration-300 hover:shadow-xl hover:scale-105"
              type="submit"
              disabled={!fileData.type}
            >
              {initialData ? "Update" : "Add"}
            </Button>
          </motion.div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}

export default AddPatientFileModal
