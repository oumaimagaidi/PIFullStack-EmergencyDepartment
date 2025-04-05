import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

// Haversine formula (if needed for distance calculation)
const computeDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Parse destination string "lat,lng" into [lat, lng]
const parseDestination = (dest) => {
  if (!dest) return null;
  const parts = dest.split(",");
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());
  return isNaN(lat) || isNaN(lng) ? null : [lat, lng];
};

// Fetch a route from OSRM API between two points.
// OSRM expects coordinates as "lng,lat" in the URL.
const fetchRoute = async (origin, destination) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes && data.routes.length > 0) {
      // OSRM returns coordinates as [lng, lat]. We swap them.
      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      return coords;
    }
  } catch (error) {
    console.error("Error fetching route:", error);
  }
  return null;
};

// Fetch place coordinates using Nominatim (OpenStreetMap)
const fetchPlaceCoordinates = async (query) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error("Error fetching place coordinates:", error);
  }
  return null;
};

const AmbulanceForm = ({ ambulance, onSave, onSearchPlace }) => {
  const [name, setName] = useState(ambulance ? ambulance.name : "");
  const [status, setStatus] = useState(ambulance ? ambulance.status : "AVAILABLE");
  const [lastUpdated, setLastUpdated] = useState(ambulance ? ambulance.lastUpdated : "");
  const [latitude, setLatitude] = useState(ambulance ? ambulance.latitude : 0);
  const [longitude, setLongitude] = useState(ambulance ? ambulance.longitude : 0);
  const [destination, setDestination] = useState(ambulance ? ambulance.destination || "" : "");
  const [searchQuery, setSearchQuery] = useState("");

  // When searching, update the destination field (instead of current location)
  const handleSearch = async () => {
    const coords = await onSearchPlace(searchQuery);
    if (coords) {
      setDestination(`${coords.lat},${coords.lng}`);
    }
  };

  const handleSubmit = () => {
    const newAmbulance = { name, status, lastUpdated, latitude, longitude, destination };
    onSave(newAmbulance);
  };

  return (
    <div className="space-y-4 mt-4">
      <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="Status" value={status} onChange={(e) => setStatus(e.target.value)} />
      <Input
        placeholder="Last Updated"
        value={lastUpdated}
        onChange={(e) => setLastUpdated(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Latitude"
        value={latitude}
        onChange={(e) => setLatitude(parseFloat(e.target.value))}
      />
      <Input
        type="number"
        placeholder="Longitude"
        value={longitude}
        onChange={(e) => setLongitude(parseFloat(e.target.value))}
      />
      <Input
        placeholder='Destination (format: "lat,lng")'
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <div className="flex space-x-2">
        <Input
          placeholder="Search for a place"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      <Button onClick={handleSubmit}>Save</Button>
    </div>
  );
};

const AmbulanceDashboard = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [currentAmbulance, setCurrentAmbulance] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [routes, setRoutes] = useState({});
  const mapRef = useRef(null);

  // Check admin status
  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user && user.role === "Administrator") setIsAdmin(true);
  }, []);

  // Fetch ambulances
  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        const response = await axios.get("http://localhost:8089/api/ambulance", { withCredentials: true });
        setAmbulances(response.data);
      } catch (error) {
        console.error("Error fetching ambulances", error);
      }
    };
    fetchAmbulances();
  }, []);

  // Fetch nurses if admin and sheet is open
  useEffect(() => {
    if (sheetOpen && isAdmin) {
      const fetchNurses = async () => {
        try {
          const response = await axios.get("http://localhost:8089/api/users/nurses", { withCredentials: true });
          setNurses(response.data);
        } catch (error) {
          console.error("Error fetching nurses", error);
        }
      };
      fetchNurses();
    }
  }, [sheetOpen, isAdmin]);

  // Adjust map view
  useEffect(() => {
    if (mapRef.current && ambulances.length > 0) {
      const bounds = ambulances.map((a) => [a.latitude, a.longitude]);
      mapRef.current.fitBounds(bounds);
    }
  }, [ambulances]);

  // Whenever ambulances update, fetch routes for those with a valid destination.
  useEffect(() => {
    ambulances.forEach(async (ambulance) => {
      if (ambulance.destination) {
        const destCoords = parseDestination(ambulance.destination);
        if (destCoords) {
          const route = await fetchRoute(
            { lat: ambulance.latitude, lng: ambulance.longitude },
            { lat: destCoords[0], lng: destCoords[1] }
          );
          if (route) {
            setRoutes((prevRoutes) => ({ ...prevRoutes, [ambulance._id]: route }));
          }
        }
      }
    });
  }, [ambulances]);

  // Save ambulance (PUT if editing, POST if new)
  const handleSaveAmbulance = async (ambulanceData) => {
    try {
      let response;
      if (currentAmbulance && currentAmbulance._id) {
        response = await axios.put(
          `http://localhost:8089/api/ambulance/${currentAmbulance._id}`,
          ambulanceData,
          { withCredentials: true }
        );
      } else {
        response = await axios.post(
          "http://localhost:8089/api/ambulance",
          ambulanceData,
          { withCredentials: true }
        );
      }
      const savedAmbulance = response.data;
      console.log("Ambulance saved", savedAmbulance);
      if (currentAmbulance && currentAmbulance._id) {
        setAmbulances(
          ambulances.map((a) =>
            a._id === currentAmbulance._id ? savedAmbulance : a
          )
        );
      } else {
        setAmbulances([...ambulances, savedAmbulance]);
      }
      setSheetOpen(false);
    } catch (error) {
      console.error("Error saving ambulance", error);
    }
  };

  // Delete ambulance (admin only)
  const handleDeleteAmbulance = async (ambulanceId) => {
    try {
      const response = await axios.delete(
        `http://localhost:8089/api/ambulance/${ambulanceId}`,
        { withCredentials: true }
      );
      console.log("Ambulance deleted", response.data);
      setAmbulances(ambulances.filter((a) => a._id !== ambulanceId));
    } catch (error) {
      console.error("Error deleting ambulance", error);
    }
  };

  // Add nurse to team (admin only)
  const handleAddTeamMember = async () => {
    if (!selectedNurse || !currentAmbulance || !currentAmbulance._id) return;
    try {
      const response = await axios.post(
        `http://localhost:8089/api/ambulance/${currentAmbulance._id}/team`,
        { userId: selectedNurse },
        { withCredentials: true }
      );
      const updatedAmbulance = response.data.ambulance;
      console.log("Team member added", updatedAmbulance);
      setCurrentAmbulance(updatedAmbulance);
      setAmbulances(
        ambulances.map((a) =>
          a._id === currentAmbulance._id ? updatedAmbulance : a
        )
      );
      setSelectedNurse("");
    } catch (error) {
      console.error("Error adding team member", error);
    }
  };

  // Handle place search for destination (using Nominatim)
  const handleSearchPlace = async (query) => {
    const coords = await fetchPlaceCoordinates(query);
    if (coords) {
      mapRef.current?.flyTo([coords.lat, coords.lng], 15);
      return coords;
    }
    return null;
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with ambulance list */}
      <div className="w-1/3 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Ambulance Tracking</h1>
        <Button
          onClick={() => {
            setCurrentAmbulance(null);
            setSheetOpen(true);
          }}
          className="mb-4"
        >
          Add Ambulance
        </Button>
        {ambulances.map((ambulance) => (
          <Card key={ambulance._id} className="mb-4">
            <CardHeader>
              <CardTitle>{ambulance.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Status: {ambulance.status}</p>
              <p>Last Updated: {ambulance.lastUpdated || "N/A"}</p>
              {ambulance.destination && (
                <p>
                  Destination: {ambulance.destination}{" "}
                  {routes[ambulance._id] && (
                    <> (Est. Time: {Math.round(
                      computeDistance(
                        ambulance.latitude,
                        ambulance.longitude,
                        parseDestination(ambulance.destination)[0],
                        parseDestination(ambulance.destination)[1]
                      ) / 40 * 60
                    )} mins)</>
                  )}
                </p>
              )}
              <Button
                onClick={() =>
                  mapRef.current?.flyTo(
                    [ambulance.latitude, ambulance.longitude],
                    15
                  )
                }
              >
                View on Map
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 ml-2"
                onClick={() => {
                  setCurrentAmbulance(ambulance);
                  setSheetOpen(true);
                }}
              >
                Edit
              </Button>
              {isAdmin && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2 ml-2"
                  onClick={() => handleDeleteAmbulance(ambulance._id)}
                >
                  Delete
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map Display */}
      <div className="w-2/3">
        <MapContainer
          ref={mapRef}
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {ambulances.map((ambulance) => {
            const routeCoords = routes[ambulance._id];
            return (
              <React.Fragment key={ambulance._id}>
                <Marker position={[ambulance.latitude, ambulance.longitude]}>
                  <Popup>
                    {ambulance.name} - {ambulance.status}
                    {routeCoords && (
                      <>
                        <br />
                        Destination: {ambulance.destination}
                        <br />
                        Est. Time: {Math.round(
                          computeDistance(
                            ambulance.latitude,
                            ambulance.longitude,
                            parseDestination(ambulance.destination)[0],
                            parseDestination(ambulance.destination)[1]
                          ) / 40 * 60
                        )} mins
                      </>
                    )}
                  </Popup>
                </Marker>
                {routeCoords && (
                  <Polyline positions={routeCoords} color="blue" />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Sheet for Add/Edit Form and Team Management */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen} style={{ zIndex: 9999 }}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{currentAmbulance ? "Edit Ambulance" : "Add New Ambulance"}</SheetTitle>
          </SheetHeader>
          <AmbulanceForm
            ambulance={currentAmbulance}
            onSave={handleSaveAmbulance}
            onSearchPlace={handleSearchPlace}
          />
          {isAdmin && currentAmbulance && currentAmbulance._id && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Team Management</h3>
              {currentAmbulance.team && currentAmbulance.team.length > 0 ? (
                <ul className="mb-4">
                  {currentAmbulance.team.map((nurse) => (
                    <li key={nurse._id} className="flex items-center">
                      <span>{nurse.username} ({nurse.email})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No team members yet.</p>
              )}
              <div className="flex items-center space-x-2">
                <select
                  value={selectedNurse}
                  onChange={(e) => setSelectedNurse(e.target.value)}
                  className="border rounded p-1 flex-1"
                >
                  <option value="">Select Nurse to add</option>
                  {nurses
                    .filter(
                      (nurse) =>
                        !currentAmbulance.team ||
                        !currentAmbulance.team.find((m) => m._id === nurse._id)
                    )
                    .map((nurse) => (
                      <option key={nurse._id} value={nurse._id}>
                        {nurse.username} ({nurse.email})
                      </option>
                    ))}
                </select>
                <Button onClick={handleAddTeamMember}>Add Nurse</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AmbulanceDashboard;
