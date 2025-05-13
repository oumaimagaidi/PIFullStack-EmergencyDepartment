import { useState } from "react"; // <-- Add useState
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Droplets, AlertTriangle, Clock, Hospital, UserCircle, CheckCircle, Users, Send } from 'lucide-react';
import DonateForm from "./DonateForm"; // <-- IMPORT DonateForm

// Color palette
const COLORS = {
  primary: "#213448",
  secondary: "#547792",
  dark: "#213448",
  light: "#ECEFCA",
};

const BloodRequestCard = ({ request, onPledgeSuccess }) => { // <-- Add onPledgeSuccess prop
  const [showDonateModal, setShowDonateModal] = useState(false); // <-- State for modal

  // ... (getUrgencyBadgeColor and getStatusBadge functions remain the same)
  const getUrgencyBadgeColor = (urgency) => {
    switch (urgency) {
      case "Critical":
        return `bg-red-500 text-white hover:bg-red-600`;
      case "Urgent":
        return `bg-orange-500 text-white hover:bg-orange-600`;
      case "Standard":
        return `bg-yellow-500 text-black hover:bg-yellow-600`;
      default:
        return `bg-gray-500 text-white hover:bg-gray-600`;
    }
  };

  const getStatusBadge = (status, quantityNeeded, quantityFulfilled) => {
    let variant = "default";
    let text = status;
    let icon = <Clock className="mr-1 h-3 w-3" />;

    if (status === "Fulfilled") {
      variant = "success";
      icon = <CheckCircle className="mr-1 h-3 w-3" />;
    } else if (status === "Partially Fulfilled") {
      variant = "outline";
      text = `Partially (${quantityFulfilled}/${quantityNeeded} units)`;
      icon = <Users className="mr-1 h-3 w-3" />;
    } else if (status === "Cancelled" || status === "Closed") {
      variant = "secondary";
    }
    // 'Open' uses default

    return (
      <Badge variant={variant} className={`text-xs ${variant === 'success' ? 'bg-green-500 text-white' : ''}`}>
        {icon}
        {text}
      </Badge>
    );
  };


  const isPledgeable = !["Fulfilled", "Closed", "Cancelled"].includes(request.status);

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col h-full"
        style={{ borderColor: COLORS.secondary, borderWidth: "1px" }}
      >
        <CardHeader className="pb-3" style={{ borderBottom: `1px solid ${COLORS.secondary}30` }}>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold flex items-center" style={{ color: COLORS.dark }}>
              <Droplets className="mr-2 h-5 w-5" style={{ color: COLORS.primary }} />
              Need: {request.bloodTypeNeeded} Blood
            </CardTitle>
            <Badge className={getUrgencyBadgeColor(request.urgency)}>
              <AlertTriangle className="mr-1 h-3 w-3" /> {request.urgency}
            </Badge>
          </div>
          <p className="text-xs pt-1" style={{ color: COLORS.dark + "80" }}>
            Posted: {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm pb-4 flex-grow">
          <div className="flex items-center" style={{ color: COLORS.dark }}>
            <Hospital className="mr-2 h-4 w-4" style={{ color: COLORS.primary }} />
            Location: {request.hospitalLocation}
          </div>
          {request.patientId && request.patientId.bloodType && (
            <div className="flex items-center" style={{ color: COLORS.dark }}>
              <UserCircle className="mr-2 h-4 w-4" style={{ color: COLORS.primary }} />
              Patient Blood Type: {request.patientId.bloodType}
            </div>
          )}
          <div className="flex items-center" style={{ color: COLORS.dark }}>
            <Users className="mr-2 h-4 w-4" style={{ color: COLORS.primary }} />
            Quantity: {request.quantityFulfilled} / {request.quantityNeeded} units
          </div>
          <div className="flex items-center">
            {getStatusBadge(request.status, request.quantityNeeded, request.quantityFulfilled)}
          </div>
          {request.reason && (
            <p className="text-xs p-2 rounded" style={{ backgroundColor: COLORS.light + "40", color: COLORS.dark }}>
              Reason: {request.reason}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-auto">
          {isPledgeable ? (
            <Button 
              onClick={() => setShowDonateModal(true)} 
              className="w-full"
              style={{ backgroundColor: COLORS.primary, color: "white" }}
            >
              <Send className="mr-2 h-4 w-4" /> Pledge to Donate
            </Button>
          ) : (
            <Button variant="outline" className="w-full" disabled>
              Donations Closed
            </Button>
          )}
          <Button 
            asChild 
            variant="outline" 
            className="w-full ml-2"
            style={{ borderColor: COLORS.secondary, color: COLORS.dark }}
          >
            <Link to={`/blood-requests/${request._id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>

      {showDonateModal && ( // <-- Render DonateForm modal
        <DonateForm
          isOpen={showDonateModal}
          onClose={() => setShowDonateModal(false)}
          bloodRequest={request}
          onPledgeSubmitted={onPledgeSuccess} // <-- Pass the callback
          colors={COLORS} // Pass the color palette
        />
      )}
    </>
  );
};

export default BloodRequestCard;
