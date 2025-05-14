"use client"

import axios from "axios"
import Cookies from "js-cookie"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Consistent Palette (can be imported from a shared file if used across many components)
const PALETTE = {
  primaryDark: "#213448",
  secondaryMuted: "#547792",
  lightAccent: "#ECEFCA",
  subtleMidTone: "#94B4C1",
  cardBackground: "#ECEFCA",
  textPrimary: "text-[#213448]",
  textSecondary: "text-[#547792]",
  borderSubtle: "border-[#D1D5DB]", // Using a standard gray for most input borders for neutrality
  borderFocus: "focus:ring-[#547792] focus:border-[#547792]",
  buttonPrimaryBg: "bg-[#547792]",
  buttonPrimaryText: "text-white",
  buttonPrimaryHoverBg: "hover:bg-[#213448]",
  buttonOutlineBorder: "border-[#94B4C1]",
  buttonOutlineText: "text-[#547792]",
  buttonOutlineHoverBorder: "hover:border-[#213448]",
  buttonOutlineHoverBg: "hover:bg-[#ECEFCA]/40",
};

const bloodRequestFormSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required."),
  bloodTypeNeeded: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Any"], {
    required_error: "Blood type is required.",
  }),
  quantityNeeded: z.coerce.number().min(1, "Quantity must be at least 1 unit."),
  urgency: z.enum(["Critical", "Urgent", "Standard"], { // Matched to ManageBloodRequestsPage badges
    required_error: "Urgency level is required.",
  }),
  reason: z.string().optional(),
  hospitalLocation: z.string().min(1, "Hospital location is required."),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
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
      urgency: "Urgent", // Default urgency
      reason: "",
      hospitalLocation: "",
      contactPerson: "",
      contactPhone: "",
      notes: "",
      expiresAt: undefined,
    },
  })

  useEffect(() => {
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
      const token = Cookies.get("token")
      if (!token) {
        toast.error("Authentication error. Please log in again.")
        setLoading(false)
        return
      }
      const response = await axios.post(`http://localhost:8089/api/blood-requests`, data, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      toast.success("Blood request created successfully!")
      if (onSuccessfullyCreated) {
        onSuccessfullyCreated(response.data)
      }
      form.reset() // Reset form on successful submission
      onClose()
    } catch (error) {
      console.error("Error creating blood request:", error.response?.data || error.message)
      toast.error(error.response?.data?.message || "Failed to create blood request.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-lg bg-[${PALETTE.cardBackground}] border ${PALETTE.borderSubtle} rounded-lg shadow-xl`}>
        <DialogHeader className="pb-4 border-b border-gray-200">
          <DialogTitle className={`${PALETTE.textPrimary} text-xl font-semibold`}>Create New Blood Request</DialogTitle>
          <DialogDescription className={`${PALETTE.textSecondary} text-sm`}>
            Fill in the details for the blood needed. This request will be visible to potential donors and staff.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-3 custom-form-scrollbar">
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Patient ID *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Patient ID"
                      {...field}
                      disabled={!!prefilledPatientId}
                      className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md`}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bloodTypeNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Blood Type Needed *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md`}>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className={`bg-[${PALETTE.cardBackground}] border ${PALETTE.borderSubtle}`}>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Any"].map((type) => (
                          <SelectItem key={type} value={type} className={`${PALETTE.textPrimary}`}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantityNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Quantity (units) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 2"
                        {...field}
                        className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="urgency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Urgency Level *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md`}>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className={`bg-[${PALETTE.cardBackground}] border ${PALETTE.borderSubtle}`}>
                      <SelectItem value="Critical" className={`${PALETTE.textPrimary}`}>Critical (Life-threatening)</SelectItem>
                      <SelectItem value="Urgent" className={`${PALETTE.textPrimary}`}>Urgent (Needed soon)</SelectItem>
                      <SelectItem value="Standard" className={`${PALETTE.textPrimary}`}>Standard (Routine need)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="hospitalLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Hospital Location / Department *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Main Hospital - Blood Bank"
                      {...field}
                      className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md`}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Reason for Request (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Surgery, Trauma, Anemia"
                      {...field}
                      className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md`}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Contact Person (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Dr. Smith"
                        {...field}
                        className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Contact Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., +1234567890"
                        {...field}
                        className={`w-full ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md`}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other relevant information..."
                      className={`w-full resize-none ${PALETTE.borderSubtle} ${PALETTE.borderFocus} ${PALETTE.textPrimary} rounded-md`}
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className={`${PALETTE.textPrimary} text-sm font-medium`}>Expires At (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            `w-full pl-3 text-left font-normal ${PALETTE.borderSubtle} ${PALETTE.borderFocus} rounded-md`,
                            !field.value && `${PALETTE.textSecondary}/70` , field.value && PALETTE.textPrimary
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span className={`${PALETTE.textSecondary}/80`}>Pick expiration date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className={`w-auto p-0 bg-[${PALETTE.cardBackground}] border ${PALETTE.borderSubtle}`} align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()))} // Today or future
                        initialFocus
                        classNames={{
                            day_selected: `${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} focus:${PALETTE.buttonPrimaryBg}`,
                            day_today: `border ${PALETTE.buttonOutlineBorder} ${PALETTE.textPrimary}`,
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs text-red-600" />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-5 border-t border-gray-200">
              <DialogClose asChild>
                <Button type="button" variant="outline" className={`${PALETTE.buttonOutlineBorder} ${PALETTE.buttonOutlineText} ${PALETTE.buttonOutlineHoverBorder} ${PALETTE.buttonOutlineHoverBg}`}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading} className={`${PALETTE.buttonPrimaryBg} ${PALETTE.buttonPrimaryText} ${PALETTE.buttonPrimaryHoverBg}`}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
       <style jsx global>{`
        .custom-form-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-form-scrollbar::-webkit-scrollbar-track {
            background: transparent; 
        }
        .custom-form-scrollbar::-webkit-scrollbar-thumb {
            background: #D1D5DB;  /* Tailwind gray-300 */
            border-radius: 10px;
        }
        .custom-form-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF; /* Tailwind gray-400 */
        }
      `}</style>
    </Dialog>
  )
}

export default CreateBloodRequestForm