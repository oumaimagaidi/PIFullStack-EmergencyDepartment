"use client"

import { useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

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
import { Loader2, Send } from "lucide-react"

// Color palette
const COLORS = {
  primary: "#547792",
  secondary: "#94B4C1",
  dark: "#213448",
  light: "#ECEFCA",
}

const donationPledgeSchema = z.object({
  donorContactPhone: z.string().min(8, "Phone number is too short.").max(15, "Phone number is too long."),
  // .refine((val) => /^\+?[1-9]\d{1,14}$/.test(val), { message: "Invalid phone number format." }),
  donorBloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"], {
    required_error: "Your blood type is required.",
  }),
  pledgedQuantity: z.coerce.number().min(1, "Pledge at least 1 unit.").default(1),
  donationNotes: z.string().optional(),
})

const DonateForm = ({ isOpen, onClose, bloodRequest, onPledgeSubmitted, colors = COLORS }) => {
  const [loading, setLoading] = useState(false)
  const user = JSON.parse(sessionStorage.getItem("user")) // Assuming user info is in sessionStorage

  const form = useForm({
    resolver: zodResolver(donationPledgeSchema),
    defaultValues: {
      donorContactPhone: user?.phoneNumber || "", // Pre-fill if available
      donorBloodType: undefined, // User needs to select
      pledgedQuantity: 1,
      donationNotes: "",
    },
  })

  const onSubmit = async (data) => {
    if (!bloodRequest?._id) {
      toast.error("Error: Blood request ID is missing.")
      return
    }
    if (!user) {
      toast.error("Error: You must be logged in to make a pledge.")
      // Optionally redirect to login: navigate('/login');
      return
    }

    setLoading(true)
    try {
      const token = Cookies.get("token")
      if (!token) {
        toast.error("Authentication error. Please log in again.")
        setLoading(false)
        return
      }

      const payload = {
        ...data,
        // donorUserId is handled by backend via authenticateToken
        // donorName is handled by backend via authenticateToken
      }

      const response = await axios.post(
        `http://localhost:8089/api/blood-requests/${bloodRequest._id}/pledge`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      )

      toast.success(response.data.message || "Donation pledged successfully!")
      if (onPledgeSubmitted) {
        onPledgeSubmitted(response.data.updatedRequest) // Pass the updated blood request
      }
      form.reset()
      onClose()
    } catch (error) {
      console.error("Error pledging donation:", error)
      toast.error(error.response?.data?.message || "Failed to pledge donation.")
    } finally {
      setLoading(false)
    }
  }

  if (!bloodRequest) return null

  return (
    
    <Dialog open={isOpen} onOpenChange={onClose} className="pt-20">
      <DialogContent className="sm:max-w-md pt-14 " style={{ backgroundColor: "white", borderColor: colors.secondary }}>
        <DialogHeader>
          <DialogTitle style={{ color: colors.dark }}>Pledge Donation for: {bloodRequest.bloodTypeNeeded}</DialogTitle>
          <DialogDescription style={{ color: colors.dark + "CC" }}>
            Thank you for your willingness to help! Please confirm your details. The hospital location is:{" "}
            <strong>{bloodRequest.hospitalLocation}</strong>.
            {bloodRequest.contactPhone && (
              <>
                {" "}
                You can also contact them at: <strong>{bloodRequest.contactPhone}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="donorContactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: colors.dark }}>Your Contact Phone *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Your phone number"
                      {...field}
                      style={{ borderColor: colors.secondary, color: colors.dark }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="donorBloodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: colors.dark }}>Your Blood Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger style={{ borderColor: colors.secondary, color: colors.dark }}>
                        <SelectValue placeholder="Select your blood type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent style={{ backgroundColor: "white", borderColor: colors.secondary }}>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((type) => (
                        <SelectItem key={type} value={type} style={{ color: colors.dark }}>
                          {type === "Unknown" ? "I don't know my blood type" : type}
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
              name="pledgedQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: colors.dark }}>Quantity to Pledge (units) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      style={{ borderColor: colors.secondary, color: colors.dark }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="donationNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: colors.dark }}>Notes for Hospital (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Availability, previous donor ID..."
                      {...field}
                      style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" style={{ borderColor: COLORS.secondary, color: colors.dark }}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading} style={{ backgroundColor: COLORS.primary, color: "white" }}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit Pledge
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DonateForm
