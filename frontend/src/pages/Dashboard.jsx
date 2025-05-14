import { Card } from "@/components/ui/card"; // Assuming Card component is simple and doesn't enforce its own strong bg/text colors
import { Users, Hospital, AlertTriangle, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import axios from "axios";
import "../App.css"; // Keep for hover-scale and other custom styles

// Chart Colors - Kept as original for now, can be themed if desired
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
const EMERGENCY_COLORS = {
    low: "#00C49F",    // Greenish
    medium: "#FFBB28", // Yellowish
    high: "#FF8042",   // Orange
    critical: "#E53E3E" // A slightly less harsh red than FF0000, but still clearly red
};

// Define our new palette colors for easier use
const PALETTE = {
    primaryDark: "#213448",
    secondaryMuted: "#547792",
    pageBackground: "#F0F4F8", // Light cool gray
    cardBackground: "#FFFFFF",
    cardBorder: "border-gray-200", // Standard Tailwind gray border
};

const Dashboard = () => {
    const [loading, setLoading] = useState(true); // You can use this to show a loader
    const [error, setError] = useState(null); // You can use this to show an error message
    const [patientsCount, setPatientsCount] = useState(0);
    const [emergencyStats, setEmergencyStats] = useState({
        total: 0,
        today: 0
    });
    const [userStats, setUserStats] = useState([]);
    const [emergencyLevelStats, setEmergencyLevelStats] = useState([]);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch user role first
                let role = null;
                try {
                    const roleResponse = await axios.get("http://localhost:8089/api/auth/me", {
                        withCredentials: true,
                    });
                    role = roleResponse.data.role;
                    setUserRole(role);
                } catch (err) {
                    console.error("Error fetching user role:", err);
                    // Potentially set an error state here if role is critical
                }

                // Fetch patient count
                const patientsResponse = await axios.get("http://localhost:8089/api/users/patients/count", {
                    withCredentials: true,
                });
                setPatientsCount(patientsResponse.data.count);

                // Fetch emergency stats
                const [totalRes, todayRes, levelRes] = await Promise.all([
                    axios.get("http://localhost:8089/api/emergency-patients/stats/total", {
                        withCredentials: true,
                    }),
                    axios.get("http://localhost:8089/api/emergency-patients/stats/today", {
                        withCredentials: true,
                    }),
                    axios.get("http://localhost:8089/api/emergency-patients/stats/levels", {
                        withCredentials: true,
                    })
                ]);
                setEmergencyStats({
                    total: totalRes.data.total,
                    today: todayRes.data.today
                });
                setEmergencyLevelStats(levelRes.data);

                // Fetch user statistics if admin
                if (role === 'Administrator') {
                    const userStatsResponse = await axios.get("http://localhost:8089/api/users/stats", {
                        withCredentials: true,
                    });
                    setUserStats(userStatsResponse.data);
                }

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load some dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Removed userRole from dependency array to avoid refetching everything on role change,
             // as role is fetched within the same effect. If role can change independently, adjust.

    const statsCards = [
        { title: "Total Patients", value: patientsCount.toLocaleString(), icon: Users, iconColor: `text-[${PALETTE.primaryDark}]`, iconBg: `bg-[${PALETTE.primaryDark}]/10` },
        { title: "Emergency Cases Today", value: emergencyStats.today.toLocaleString(), icon: Hospital, iconColor: "text-red-600", iconBg: "bg-red-100" }, // Semantic color
        { title: "Total Emergency Cases", value: emergencyStats.total.toLocaleString(), icon: Hospital, iconColor: "text-red-700", iconBg: "bg-red-100" }  // Semantic color
    ];

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };
    
    // Basic Loading and Error States
    if (loading) {
        return <div className={`flex justify-center items-center h-screen bg-[${PALETTE.pageBackground}] text-[${PALETTE.primaryDark}]`}>Loading Dashboard Data...</div>;
    }
    if (error) {
        return <div className={`flex justify-center items-center h-screen bg-[${PALETTE.pageBackground}] text-red-600`}>{error}</div>;
    }

    return (
        <div className={`p-6 space-y-8 min-h-screen bg-[${PALETTE.pageBackground}]`}>
            <div className="flex items-center justify-between ">
                <h1 className={`text-3xl font-extrabold tracking-tight text-[${PALETTE.primaryDark}]`}> Dashboard</h1>
                <div className={`text-sm text-[${PALETTE.secondaryMuted}]`}>
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {statsCards.map((stat) => (
                    <Card key={stat.title} className={`p-6 hover-scale bg-[${PALETTE.cardBackground}] ${PALETTE.cardBorder} shadow-sm`}>
                        <div className="flex items-center gap-4">
                            <div className={`${stat.iconColor} ${stat.iconBg} p-3 rounded-lg`}>
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className={`text-sm text-[${PALETTE.secondaryMuted}]`}>{stat.title}</p>
                                <h3 className={`text-2xl font-bold text-[${PALETTE.primaryDark}]`}>{stat.value}</h3>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className={`grid gap-6 ${userRole === 'Administrator' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'}`}>
                {userRole === 'Administrator' && userStats.length > 0 && (
                    <Card className={`p-6 bg-[${PALETTE.cardBackground}] ${PALETTE.cardBorder} shadow-sm`}>
                        <h2 className={`text-xl font-semibold mb-4 text-[${PALETTE.primaryDark}]`}>Department Statistics</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={userStats} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke={PALETTE.secondaryMuted} fontSize={12} />
                                <YAxis stroke={PALETTE.secondaryMuted} fontSize={12} />
                                <Tooltip wrapperStyle={{ backgroundColor: PALETTE.cardBackground, border: `1px solid ${PALETTE.cardBorder}`, borderRadius: '4px' }} />
                                <Legend wrapperStyle={{ color: PALETTE.secondaryMuted, fontSize: '12px' }}/>
                                <Bar dataKey="count" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {userRole === 'Administrator' && userStats.length > 0 && (
                    <Card className={`p-6 bg-[${PALETTE.cardBackground}] ${PALETTE.cardBorder} shadow-sm`}>
                        <h2 className={`text-xl font-semibold mb-4 text-[${PALETTE.primaryDark}]`}>User Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userStats}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8" // Default fill, overridden by Cell
                                    label={renderCustomizedLabel}
                                    labelLine={false}
                                >
                                    {userStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip wrapperStyle={{ backgroundColor: PALETTE.cardBackground, border: `1px solid ${PALETTE.cardBorder}`, borderRadius: '4px' }}/>
                                <Legend wrapperStyle={{ color: PALETTE.secondaryMuted, fontSize: '12px' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                )}

                {emergencyLevelStats.length > 0 && (
                    <Card className={`p-6 bg-[${PALETTE.cardBackground}] ${PALETTE.cardBorder} shadow-sm ${userRole !== 'Administrator' ? 'md:col-span-1' : ''}`}> {/* Adjust span if not admin */}
                        <h2 className={`text-xl font-semibold mb-4 text-[${PALETTE.primaryDark}]`}>Emergency Cases by Severity</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={emergencyLevelStats}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 30, bottom: 5 }} // Adjusted margin for labels
                            >
                                <XAxis type="number" stroke={PALETTE.secondaryMuted} fontSize={12}/>
                                <YAxis dataKey="emergencyLevel" type="category" stroke={PALETTE.secondaryMuted} fontSize={12} width={80} tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} />
                                <Tooltip wrapperStyle={{ backgroundColor: PALETTE.cardBackground, border: `1px solid ${PALETTE.cardBorder}`, borderRadius: '4px' }} />
                                <Legend wrapperStyle={{ color: PALETTE.secondaryMuted, fontSize: '12px' }}/>
                                <Bar dataKey="count" name="Number of Cases" radius={[0, 4, 4, 0]}>
                                    {emergencyLevelStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={EMERGENCY_COLORS[entry.emergencyLevel.toLowerCase()] || PALETTE.secondaryMuted} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}
            </div>

            {emergencyLevelStats.length > 0 && (
                 <div className="grid gap-6 md:grid-cols-2">
                    <Card className={`p-6 bg-[${PALETTE.cardBackground}] ${PALETTE.cardBorder} shadow-sm`}>
                        <h2 className={`text-xl font-semibold mb-4 text-[${PALETTE.primaryDark}]`}>Emergency Level Distribution</h2>
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
                                        <Cell key={`cell-${index}`} fill={EMERGENCY_COLORS[entry.emergencyLevel.toLowerCase()] || PALETTE.secondaryMuted} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name, props) => [
                                        `${value} cases`,
                                        `${name.charAt(0).toUpperCase() + name.slice(1)} (Avg pain: ${props.payload.averagePainLevel?.toFixed(1) || 'N/A'})`
                                    ]}
                                    wrapperStyle={{ backgroundColor: PALETTE.cardBackground, border: `1px solid ${PALETTE.cardBorder}`, borderRadius: '4px' }}
                                />
                                <Legend 
                                    formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)} 
                                    wrapperStyle={{ color: PALETTE.secondaryMuted, fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card className={`p-6 bg-[${PALETTE.cardBackground}] ${PALETTE.cardBorder} shadow-sm`}>
                        <h2 className={`text-xl font-semibold mb-4 text-[${PALETTE.primaryDark}]`}>Emergency Cases Overview</h2>
                        <div className="space-y-3">
                            {emergencyLevelStats.map((stat) => (
                                <div key={stat.emergencyLevel} className={`flex items-center justify-between p-3 ${PALETTE.cardBorder} rounded-lg bg-[${PALETTE.primaryDark}]/5`}>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: EMERGENCY_COLORS[stat.emergencyLevel.toLowerCase()] || PALETTE.secondaryMuted }}
                                        />
                                        <span className={`capitalize font-medium text-[${PALETTE.primaryDark}]`}>{stat.emergencyLevel}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold text-sm text-[${PALETTE.primaryDark}]`}>{stat.count} cases</p>
                                        <p className={`text-xs text-[${PALETTE.secondaryMuted}]`}>
                                            Avg. pain: {stat.averagePainLevel?.toFixed(1) || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
           
        </div>
    );
};

export default Dashboard;