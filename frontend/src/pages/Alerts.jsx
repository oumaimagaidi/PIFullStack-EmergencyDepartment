// Alerts.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    // 1) Fetch existing alerts
    axios
      .get("http://localhost:8089/api/alerts/ambulance", {
        withCredentials: true,
      })
      .then(({ data }) => {
        setAlerts(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      })
      .catch((err) => console.error("Failed to fetch alerts:", err));

    // 2) Set up real-time socket
    socketRef.current = io("http://localhost:8089", { withCredentials: true });

    socketRef.current.on("connect", () => {
      console.log("🔔 Alerts socket connected:", socketRef.current.id);
    });

    socketRef.current.on("alert", (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const clearAlerts = () => setAlerts([]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🚨 Ambulance Alerts</h1>
        <Button variant="outline" onClick={clearAlerts}>
          Clear All
        </Button>
      </div>

      {alerts.length === 0 ? (
        <p className="text-muted-foreground">No alerts at the moment.</p>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {alerts.map((a) => (
            <Card key={a._id}>
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                <CardTitle className="text-lg font-semibold">
                  🚑 Source: {a.source}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </CardHeader>
              <CardContent>
                <p>{a.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;
