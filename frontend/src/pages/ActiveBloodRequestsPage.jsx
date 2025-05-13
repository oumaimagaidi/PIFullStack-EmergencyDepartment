import { useState, useEffect } from "react";
import axios from "axios";
import BloodRequestCard from "../components/blood/BloodRequestCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Droplets } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from "@/components/ui/card";
const ActiveBloodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBloodType, setFilterBloodType] = useState("All");
  const [filterUrgency, setFilterUrgency] = useState("All");

  const bloodTypes = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Any"];
  const urgencies = ["All", "Critical", "Urgent", "Standard"];

 const fetchActiveRequests = async () => { // Encapsulate fetch logic
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:8089/api/blood-requests/active`);
      const sortedRequests = response.data.sort((a, b) => {
          const urgencyOrder = { Critical: 0, Urgent: 1, Standard: 2 };
          if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
              return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setRequests(sortedRequests);
      // setFilteredRequests(sortedRequests); // Filtering will be handled by useEffect
    } catch (err) {
      console.error("Error fetching active blood requests:", err);
      setError(err.response?.data?.message || "Failed to load active blood requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRequests();
  }, []);

  useEffect(() => {
    let currentFiltered = requests;

    if (searchTerm) {
      currentFiltered = currentFiltered.filter(
        (req) =>
          req.hospitalLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.bloodTypeNeeded.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterBloodType !== "All") {
      currentFiltered = currentFiltered.filter(
        (req) => req.bloodTypeNeeded === filterBloodType
      );
    }

    if (filterUrgency !== "All") {
      currentFiltered = currentFiltered.filter(
        (req) => req.urgency === filterUrgency
      );
    }
    setFilteredRequests(currentFiltered);
  }, [searchTerm, filterBloodType, filterUrgency, requests]);
const handlePledgeSuccess = (updatedRequest) => {
    // Update the specific request in the main 'requests' list
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req._id === updatedRequest._id ? updatedRequest : req
      )
    );};

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        {/* ... Skeleton UI ... */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
             <Droplets className="mr-3 h-8 w-8 text-red-500 animate-pulse" />
            Active Blood Needs
          </h1>
          <p className="text-gray-600">Urgently needed blood donations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto p-4 md:p-8">
        {/* ... (Header and Filters UI remain the same) ... */}
         <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-3 flex items-center justify-center">
            <Droplets className="mr-3 h-10 w-10 text-red-600" />
            Active Blood Needs
          </h1>
          <p className="text-lg text-gray-600">
            Your help can save a life. Find an active request below.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center">
            <Input
                type="text"
                placeholder="Search by location, reason, blood type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
            />
            <div className="flex gap-4 w-full sm:w-auto">
                <Select value={filterBloodType} onValueChange={setFilterBloodType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Blood Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {bloodTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                        {urgencies.map(urgency => <SelectItem key={urgency} value={urgency}>{urgency}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>

        {filteredRequests.length === 0 ? (
          // ... (No requests UI remains the same) ...
          <div className="text-center py-10">
           {/* Add an appropriate SVG or image */}
            <p className="text-xl text-gray-500">
              No active blood requests matching your criteria at the moment.
            </p>
            <p className="text-gray-400 mt-2">Thank you for checking!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <BloodRequestCard
                key={request._id}
                request={request}
                onPledgeSuccess={handlePledgeSuccess} // <-- Pass the handler
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveBloodRequestsPage;