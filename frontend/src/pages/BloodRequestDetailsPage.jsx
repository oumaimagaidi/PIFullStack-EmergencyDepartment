import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Droplets, UserCircle, Hospital, Clock, CheckCircle, Users, Phone, MessageSquare, CalendarDays } from "lucide-react";
// Assume UpdateBloodRequestForm will be created for staff
// import UpdateBloodRequestForm from "@/components/blood/UpdateBloodRequestForm";


const BloodRequestDetailsPage = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [showUpdateModal, setShowUpdateModal] = useState(false); // For staff
  // const user = JSON.parse(sessionStorage.getItem("user")); // Get logged in user

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // No token needed if this is a public-ish page, but if details are sensitive, add auth
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/blood-requests/${id}`);
        setRequest(response.data);
      } catch (err) {
        console.error("Error fetching blood request details:", err);
        setError(
          err.response?.data?.message || "Failed to load blood request details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const getUrgencyBadgeColor = (urgency) => {
    // Same as in BloodRequestCard
    switch (urgency) {
      case "Critical": return "bg-red-500 text-white";
      case "Urgent": return "bg-orange-500 text-white";
      case "Standard": return "bg-yellow-500 text-black";
      default: return "bg-gray-500 text-white";
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

    return (
      <Badge variant={variant} className={`text-sm py-1 px-3 ${variant === 'success' ? 'bg-green-100 text-green-700 border-green-300' : ''}`}>
        {icon}
        {text}
      </Badge>
    );
  };


  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Skeleton className="h-10 w-1/4 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-1/3" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/blood-requests"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Active Requests</Link>
        </Button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <p>Blood request not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/blood-requests">Go to Active Requests</Link>
        </Button>
      </div>
    );
  }

  // const canManage = user && (user.role === 'Administrator' || user.role === 'Doctor' || user.role === 'Nurse' || user.id === request.requestingStaffId?._id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto p-4 md:p-8">
        <Button asChild variant="outline" className="mb-6">
          <Link to="/blood-requests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Active Requests
          </Link>
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-3xl font-bold flex items-center">
                        <Droplets className="mr-3 h-8 w-8" />
                        Blood Need: {request.bloodTypeNeeded}
                    </CardTitle>
                    <CardDescription className="text-red-100 mt-1">
                        Patient: {request.patientId?.firstName || 'N/A'} {request.patientId?.lastName || ''}
                        {request.patientId?.bloodType && ` (Patient Blood Type: ${request.patientId.bloodType})`}
                    </CardDescription>
                </div>
                <Badge className={`${getUrgencyBadgeColor(request.urgency)} px-4 py-2 text-sm`}>
                   {request.urgency}
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <InfoItem icon={<Users />} label="Quantity Status" value={`${request.quantityFulfilled} / ${request.quantityNeeded} units`} />
                    <InfoItem icon={<Hospital />} label="Location" value={request.hospitalLocation} />
                    {request.reason && <InfoItem icon={<MessageSquare />} label="Reason for Request" value={request.reason} />}
                </div>
                <div className="space-y-4">
                    <InfoItem icon={<Clock />} label="Overall Status">
                        {getStatusBadge(request.status, request.quantityNeeded, request.quantityFulfilled)}
                    </InfoItem>
                    <InfoItem icon={<UserCircle />} label="Requested By" value={request.requestingStaffId?.username || 'N/A'} />
                    <InfoItem icon={<CalendarDays />} label="Date Requested" value={new Date(request.createdAt).toLocaleString()} />
                    {request.expiresAt && <InfoItem icon={<CalendarDays />} label="Expires At" value={new Date(request.expiresAt).toLocaleString()} />}
                </div>
            </div>

            {request.notes && (
              <div className="pt-4">
                <h3 className="font-semibold text-gray-700 mb-1">Additional Notes:</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{request.notes}</p>
              </div>
            )}

            {(request.contactPerson || request.contactPhone) && (
              <Card className="mt-6 bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700 flex items-center">
                    <Phone className="mr-2 h-5 w-5" /> Contact for Donation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-1">
                  {request.contactPerson && <p><strong>Person:</strong> {request.contactPerson}</p>}
                  {request.contactPhone && <p><strong>Phone:</strong> {request.contactPhone}</p>}
                  <p className="mt-2 text-xs italic">Please mention the request creation date or patient context if possible when contacting.</p>
                </CardContent>
              </Card>
            )}

             {/* {canManage && (
                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">Manage Request</h3>
                    <Button onClick={() => setShowUpdateModal(true)}>Update Request Status/Quantity</Button>
                    {showUpdateModal && (
                        <UpdateBloodRequestForm
                            request={request}
                            onClose={() => setShowUpdateModal(false)}
                            onUpdated={(updatedRequest) => {
                                setRequest(updatedRequest);
                                setShowUpdateModal(false);
                            }}
                        />
                    )}
                </div>
            )} */}


          </CardContent>
          <CardFooter className="bg-gray-50 p-4 text-xs text-gray-500">
            Request ID: {request._id}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

// Helper component for displaying info items
const InfoItem = ({ icon, label, value, children }) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 text-gray-500">{icon}</div>
    <div className="ml-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {value && <p className="text-gray-800 font-medium">{value}</p>}
      {children && <div className="text-gray-800 font-medium">{children}</div>}
    </div>
  </div>
);

export default BloodRequestDetailsPage;