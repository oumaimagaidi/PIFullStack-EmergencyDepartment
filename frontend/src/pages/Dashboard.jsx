"use client"

import { Card } from "@/components/ui/card"
import { Users, Hospital } from "lucide-react"
import { useState, useEffect } from "react"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import axios from "axios"
import "../App.css"

// Updated color palette
const COLORS = ["#213448", "#547792", "#94B4C1", "#ECEFCA", "#DDA853"]
const EMERGENCY_COLORS = {
  low: "#94B4C1",
  medium: "#DDA853",
  high: "#547792",
  critical: "#213448",
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [patientsCount, setPatientsCount] = useState(0)
  const [emergencyStats, setEmergencyStats] = useState({
    total: 0,
    today: 0,
  })
  const [userStats, setUserStats] = useState([])
  const [emergencyLevelStats, setEmergencyLevelStats] = useState([])
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("http://localhost:8089/api/auth/me", {
          withCredentials: true,
        })
        setUserRole(response.data.role)
      } catch (err) {
        console.error("Error fetching user role:", err)
      }
    }
    fetchUserRole()
  }, [])

  useEffect(() => {
    const fetchPatientsCount = async () => {
      try {
        const response = await axios.get("http://localhost:8089/api/users/patients/count", {
          withCredentials: true,
        })
        setPatientsCount(response.data.count)
      } catch (err) {
        console.error("Error fetching patients count", err)
      }
    }
    fetchPatientsCount()
  }, [])

  useEffect(() => {
    const fetchEmergencyStats = async () => {
      try {
        const [totalRes, todayRes, levelRes] = await Promise.all([
          axios.get("http://localhost:8089/api/emergency-patients/stats/total", {
            withCredentials: true,
          }),
          axios.get("http://localhost:8089/api/emergency-patients/stats/today", {
            withCredentials: true,
          }),
          axios.get("http://localhost:8089/api/emergency-patients/stats/levels", {
            withCredentials: true,
          }),
        ])
        setEmergencyStats({
          total: totalRes.data.total,
          today: todayRes.data.today,
        })
        setEmergencyLevelStats(levelRes.data)
      } catch (err) {
        console.error("Error fetching emergency stats:", err)
      }
    }
    fetchEmergencyStats()
  }, [])

  useEffect(() => {
    const fetchUserStatistics = async () => {
      if (userRole === "Administrator") {
        // Seulement si admin
        try {
          const response = await axios.get("http://localhost:8089/api/users/stats", {
            withCredentials: true,
          })
          setUserStats(response.data)
        } catch (err) {
          console.error("Error fetching user stats:", err)
        }
      }
    }
    fetchUserStatistics()
  }, [userRole])

  const statsCards = [
    {
      title: "Total Patients",
      value: patientsCount.toLocaleString(),
      icon: Users,
      color: "text-[#547792]",
      bg: "bg-[#ECEFCA]",
    },
    {
      title: "Emergency Cases Today",
      value: emergencyStats.today.toLocaleString(),
      icon: Hospital,
      color: "text-[#213448]",
      bg: "bg-[#94B4C1]",
    },
    {
      title: "Total Emergency Cases",
      value: emergencyStats.total.toLocaleString(),
      icon: Hospital,
      color: "text-[#ECEFCA]",
      bg: "bg-[#213448]",
    },
  ]

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180)
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180)

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6 bg-[#ECEFCA]/10 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-[#213448]">Dashboard</h1>
        <div className="text-sm text-[#547792]">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="p-6 hover-scale border-[#94B4C1]/30">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} ${stat.bg} p-3 rounded-lg`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-[#547792]">{stat.title}</p>
                <h3 className="text-2xl font-bold text-[#213448]">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div
        className={`grid gap-6 ${userRole === "Administrator" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-1"}`}
      >
        {userRole === "Administrator" && (
          <Card className="p-6 border-[#94B4C1]/30">
            <h2 className="text-xl font-semibold mb-4 text-[#213448]">Department Statistics</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userStats}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "#ECEFCA", borderColor: "#94B4C1" }} />
                <Bar dataKey="count" fill="#547792" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {userRole === "Administrator" && (
          <Card className="p-6 border-[#94B4C1]/30">
            <h2 className="text-xl font-semibold mb-4 text-[#213448]">User Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userStats}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {userStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#ECEFCA", borderColor: "#94B4C1" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        <Card className="p-6 border-[#94B4C1]/30">
          <h2 className="text-xl font-semibold mb-4 text-[#213448]">Emergency Cases by Severity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emergencyLevelStats} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="emergencyLevel" type="category" />
              <Tooltip contentStyle={{ backgroundColor: "#ECEFCA", borderColor: "#94B4C1" }} />
              <Legend />
              <Bar dataKey="count" name="Number of Cases" fill="#547792">
                {emergencyLevelStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EMERGENCY_COLORS[entry.emergencyLevel]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 border-[#94B4C1]/30">
          <h2 className="text-xl font-semibold mb-4 text-[#213448]">Emergency Level Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={emergencyLevelStats}
                dataKey="count"
                nameKey="emergencyLevel"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {emergencyLevelStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EMERGENCY_COLORS[entry.emergencyLevel]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#ECEFCA", borderColor: "#94B4C1" }}
                formatter={(value, name, props) => [
                  value,
                  `${name} (Average pain: ${props.payload.averagePainLevel?.toFixed(1) || "N/A"})`,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border-[#94B4C1]/30">
          <h2 className="text-xl font-semibold mb-4 text-[#213448]">Emergency Cases Overview</h2>
          <div className="space-y-4">
            {emergencyLevelStats.map((stat) => (
              <div
                key={stat.emergencyLevel}
                className="flex items-center justify-between p-4 border border-[#94B4C1]/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: EMERGENCY_COLORS[stat.emergencyLevel] }}
                  />
                  <span className="capitalize font-medium text-[#213448]">{stat.emergencyLevel}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#213448]">{stat.count} cases</p>
                  <p className="text-sm text-[#547792]">Avg. pain: {stat.averagePainLevel?.toFixed(1) || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
