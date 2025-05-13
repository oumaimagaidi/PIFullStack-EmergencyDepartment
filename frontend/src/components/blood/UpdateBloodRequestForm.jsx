"use client"

import { useState, useEffect } from "react"
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
import { Loader2 } from "lucide-react"

// Color palette
const COLORS = {
  primary: "#547792",
  secondary: "#94B4C1",
  dark: "#213448",
  light: "#ECEFCA",
}

const updateBloodRequestFormSchema = z.object({
  quantityFulfilled: z.coerce.number().min(0, "Fulfilled quantity cannot be negative."),
  status: z.enum(["Open", "Partially Fulfilled", "Fulfilled", "Closed", "Cancelled"], {
    required_error: "Status is required.",
  }),
  notes: z.string().optional(),
  // Add other fields from BloodRequest model that staff can update
  // For example: hospitalLocation, contactPerson, contactPhone, reason, expiresAt
  // But typically, only status, quantityFulfilled, and notes are most frequently updated post-creation.
})

const UpdateBloodRequestForm = ({ isOpen, onClose, request, onSuccessfullyUpdated }) => {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(updateBloodRequestFormSchema),
    defaultValues: {
      quantityFulfilled: request?.quantityFulfilled || 0,
      status: request?.status || "Open",
      notes: request?.notes || "",
    },
  })

  useEffect(() => {
    if (request && isOpen) {
      form.reset({
        quantityFulfilled: request.quantityFulfilled || 0,
        status: request.status || "Open",
        notes: request.notes || "",
      })
    }
  }, [request, isOpen, form])

  const onSubmit = async (data) => {
    if (!request?._id) {
      toast.error("Cannot update: Request ID is missing.")
      return
    }
    setLoading(true)
    try {
      const token = Cookies.get("token")
      if (!token) {
        toast.error("Authentication error.")
        setLoading(false)
        return
      }

      // Ensure quantityFulfilled is not more than quantityNeeded
      if (data.quantityFulfilled > request.quantityNeeded) {
        form.setError("quantityFulfilled", {
          type: "manual",
          message: `Fulfilled quantity cannot exceed needed quantity of ${request.quantityNeeded}.`,
        })
        setLoading(false)
        return
      }

      const response = await axios.put(`http://localhost:8089/api/blood-requests/${request._id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })

      toast.success("Blood request updated successfully!")
      if (onSuccessfullyUpdated) {
        onSuccessfullyUpdated(response.data)
      }
      onClose()
    } catch (error) {
      console.error("Error updating blood request:", error)
      toast.error(error.response?.data?.message || "Failed to update blood request.")
    } finally {
      setLoading(false)
    }
  }

  if (!request) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]" style={{ backgroundColor: "white", borderColor: COLORS.secondary }}>
        <DialogHeader>
          <DialogTitle style={{ color: COLORS.dark }}>Update Blood Request</DialogTitle>
          <DialogDescription style={{ color: COLORS.dark + "CC" }}>
            Update the status, fulfilled quantity, or notes for this request.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div
              className="p-3 rounded-md border"
              style={{ backgroundColor: COLORS.light + "30", borderColor: COLORS.secondary }}
            >
              <p className="text-sm font-medium" style={{ color: COLORS.dark }}>
                Request Details:
              </p>
              <p className="text-xs" style={{ color: COLORS.dark + "CC" }}>
                Patient Need: {request.bloodTypeNeeded} (Needed: {request.quantityNeeded} units)
              </p>
              <p className="text-xs" style={{ color: COLORS.dark + "CC" }}>
                Current Status: {request.status}
              </p>
            </div>
            <FormField
              control={form.control}
              name="quantityFulfilled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: COLORS.dark }}>Quantity Fulfilled (units) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 1"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: COLORS.dark }}>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger style={{ borderColor: COLORS.secondary, color: COLORS.dark }}>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent style={{ backgroundColor: "white", borderColor: COLORS.secondary }}>
                      {["Open", "Partially Fulfilled", "Fulfilled", "Closed", "Cancelled"].map((s) => (
                        <SelectItem key={s} value={s} style={{ color: COLORS.dark }}>
                          {s}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel style={{ color: COLORS.dark }}>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Update notes if necessary..."
                      className="resize-none"
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
                <Button type="button" variant="outline" style={{ borderColor: COLORS.secondary, color: COLORS.dark }}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading} style={{ backgroundColor: COLORS.primary, color: "white" }}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateBloodRequestForm
