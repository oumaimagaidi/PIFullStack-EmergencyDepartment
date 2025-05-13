"use client"

import axios from "axios"
import Cookies from "js-cookie" // For fetching the auth token
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar" // Assuming you have this
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Color palette
const COLORS = {
  primary: "#547792",
  secondary: "#94B4C1",
  dark: "#213448",
  light: "#ECEFCA",
}

const bloodRequestFormSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required."), // Should be a valid ObjectId
  bloodTypeNeeded: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Any"], {
    required_error: "Blood type is required.",
  }),
  quantityNeeded: z.coerce.number().min(1, "Quantity must be at least 1 unit."),
  urgency: z.enum(["Critical", "Urgent", "Standard"], {
    required_error: "Urgency level is required.",
  }),
  reason: z.string().optional(),
  hospitalLocation: z.string().min(1, "Hospital location is required."),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  //   .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), { // Basic E.164-like validation
  //   message: "Invalid phone number format.",
  // }),
  notes: z.string().optional(),
  expiresAt: z.date().optional(),
})

const CreateBloodRequestForm = ({ isOpen, onClose, patientId: prefilledPatientId, onSuccessfullyCreated }) => {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(bloodRequestFormSchema),
    defaultValues: {
      patientId: prefilledPatientId || "",
      bloodTypeNeeded: undefined,
      quantityNeeded: 1,
      urgency: "Urgent",
      reason: "",
      hospitalLocation: "", // Could prefill based on user's department
      contactPerson: "",
      contactPhone: "",
      notes: "",
      expiresAt: undefined,
    },
  })

  useEffect(() => {
    // Effect to reset form when prefilledPatientId changes or modal opens
    if (isOpen) {
      form.reset({
        patientId: prefilledPatientId || "",
        bloodTypeNeeded: undefined,
        quantityNeeded: 1,
        urgency: "Urgent",
        reason: "",
        hospitalLocation: "",
        contactPerson: "",
        contactPhone: "",
        notes: "",
        expiresAt: undefined,
      })
    }
  }, [isOpen, prefilledPatientId, form])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const token = Cookies.get("token") // Get token from cookies
      if (!token) {
        toast.error("Authentication error. Please log in again.")
        setLoading(false)
        return
      }

      const response = await axios.post(`http://localhost:8089/api/blood-requests`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
      toast.success("Blood request created successfully!")
      if (onSuccessfullyCreated) {
        onSuccessfullyCreated(response.data)
      }
      form.reset()
      onClose()
    } catch (error) {
      console.error("Error creating blood request:", error)
      toast.error(error.response?.data?.message || "Failed to create blood request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]" style={{ backgroundColor: "white", borderColor: COLORS.secondary }}>
        <DialogHeader>
          <DialogTitle style={{ color: COLORS.dark }}>Create New Blood Request</DialogTitle>
          <DialogDescription style={{ color: COLORS.dark + "CC" }}>
            Fill in the details for the blood needed. This request will be made visible to potential donors and relevant
            staff.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: COLORS.dark }}>Patient ID *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Patient ID"
                      {...field}
                      disabled={!!prefilledPatientId}
                      style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bloodTypeNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: COLORS.dark }}>Blood Type Needed *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger style={{ borderColor: COLORS.secondary, color: COLORS.dark }}>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent style={{ backgroundColor: "white", borderColor: COLORS.secondary }}>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Any"].map((type) => (
                          <SelectItem key={type} value={type} style={{ color: COLORS.dark }}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantityNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: COLORS.dark }}>Quantity Needed (units) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2"
                        {...field}
                        style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: COLORS.dark }}>Urgency Level *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger style={{ borderColor: COLORS.secondary, color: COLORS.dark }}>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent style={{ backgroundColor: "white", borderColor: COLORS.secondary }}>
                      <SelectItem value="Critical" style={{ color: COLORS.dark }}>
                        Critical (Life-threatening, immediate)
                      </SelectItem>
                      <SelectItem value="Urgent" style={{ color: COLORS.dark }}>
                        Urgent (Needed within hours)
                      </SelectItem>
                      <SelectItem value="Standard" style={{ color: COLORS.dark }}>
                        Standard (Needed within 24-48 hours)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hospitalLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: COLORS.dark }}>Hospital Location / Department *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Main Hospital - Blood Bank"
                      {...field}
                      style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: COLORS.dark }}>Reason for Request (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Surgery, Trauma, Anemia"
                      {...field}
                      style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: COLORS.dark }}>Contact Person (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Dr. Smith / Blood Bank"
                        {...field}
                        style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel style={{ color: COLORS.dark }}>Contact Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., +1234567890"
                        {...field}
                        style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: COLORS.dark }}>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other relevant information..."
                      className="resize-none"
                      {...field}
                      style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel style={{ color: COLORS.dark }}>Expires At (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          style={{
                            borderColor: COLORS.secondary,
                            color: field.value ? COLORS.dark : COLORS.dark + "80",
                          }}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="start"
                      style={{ backgroundColor: "white", borderColor: COLORS.secondary }}
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))} // Disable past dates
                        initialFocus
                        styles={{
                          selected: { backgroundColor: COLORS.primary },
                          today: { borderColor: COLORS.secondary },
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" style={{ borderColor: COLORS.secondary, color: COLORS.dark }}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading} style={{ backgroundColor: COLORS.primary, color: "white" }}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateBloodRequestForm
