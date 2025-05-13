import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Database, CheckCircle, Search, BedDouble, Activity, Hospital, Users } from "lucide-react";
import { useState } from "react";
// import { Separator } from "@/components/ui/separator"; // Optionnel, si vous voulez une ligne de séparation plus stylée

const STATUS_STYLES = {
  available: {
    text: "text-green-700 dark:text-green-400", // Légèrement plus foncé pour le texte
    bg: "bg-green-100 dark:bg-green-800/60",    // Fond plus opaque
    dot: "bg-green-500 dark:bg-green-400",
  },
  "in-maintenance": {
    text: "text-yellow-700 dark:text-yellow-400", // Légèrement plus foncé
    bg: "bg-yellow-100 dark:bg-yellow-800/60",   // Fond plus opaque
    dot: "bg-yellow-500 dark:bg-yellow-400",
  },
};

const STATIC_RESOURCES = [
  { _id: "1", name: "General Bed A1", type: "bed", location: "Ward A", status: "available", quantity: 2 },
  { _id: "2", name: "ICU Unit 1", type: "icu", location: "ICU Wing", status: "in-maintenance", quantity: 1 },
  { _id: "3", name: "Ventilator V2", type: "ventilator", location: "Emergency Room", status: "available", quantity: 3 },
  { _id: "4", name: "Wheelchair W5", type: "wheelchair", location: "Floor 2", status: "available", quantity: 5 },
];

const STATIC_ALLOCATED_RESOURCES = [
  { _id: "alloc1", name: "CT Scan Room 1", type: "ct-scan", location: "Radiology Dept" },
  { _id: "alloc2", name: "MRI Unit B", type: "mri", location: "Imaging Center" },
];

const getResourceIcon = (type, className = "w-5 h-5 mr-2") => {
  switch (type.toLowerCase()) {
    case "bed": return <BedDouble className={`${className} text-blue-500 dark:text-blue-400`} />;
    case "icu": return <Activity className={`${className} text-red-500 dark:text-red-400`} />;
    case "ventilator": return <Users className={`${className} text-teal-500 dark:text-teal-400`} />;
    case "wheelchair": return <Users className={`${className} text-purple-500 dark:text-purple-400`} />;
    case "ct-scan":
    case "mri":
      return <Hospital className={`${className} text-indigo-500 dark:text-indigo-400`} />;
    default: return <Database className={`${className} text-gray-500 dark:text-gray-400`} />;
  }
};

export default function PatientResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = STATIC_RESOURCES.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAvailable = STATIC_RESOURCES.filter((r) => r.status === "available").reduce((sum, r) => sum + r.quantity, 0);
  const totalInMaintenance = STATIC_RESOURCES.filter((r) => r.status === "in-maintenance").reduce((sum, r) => sum + r.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-4 md:p-6 lg:p-8 transition-colors duration-300">
      {/* Carte Principale pour TOUT le contenu de cette page */}
      <Card className="w-full max-w-full mx-auto shadow-2xl bg-white dark:bg-slate-900 rounded-2xl">
        <CardHeader className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Hospital Resources
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Overview and management of available medical resources.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-auto mt-4 sm:mt-0">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, type, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg w-full sm:w-72 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow focus:shadow-md"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Section principale de contenu (stats et grille) */}
            <div className="w-full lg:w-3/4 space-y-8">
              {/* Stats Cards */}
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                <Card className="p-6 bg-slate-50 dark:bg-slate-800/70 shadow-lg rounded-xl border border-transparent dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-full">
                        <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Available (Units)</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalAvailable}</h3>
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-slate-50 dark:bg-slate-800/70 shadow-lg rounded-xl border border-transparent dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-100 dark:bg-yellow-500/20 rounded-full">
                        <Database className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">In Maintenance (Units)</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalInMaintenance}</h3>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Resource Grid */}
              {filteredResources.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredResources.map((resource) => (
                    <Card
                      key={resource._id}
                      className="overflow-hidden bg-white dark:bg-slate-800/70 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group border border-transparent dark:border-slate-700"
                    >
                      <div
                        className="h-44 bg-cover bg-center relative group-hover:scale-105 transition-transform duration-300"
                        style={{
                          backgroundImage: `url(https://picsum.photos/seed/${resource.type.replace(/\s+/g, '')}${resource._id}/800/450)`,
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                        <div className={`absolute top-3 right-3 px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_STYLES[resource.status]?.bg} ${STATUS_STYLES[resource.status]?.text}`}>
                          {resource.status.replace('-', ' ')}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center mb-1.5">
                          {getResourceIcon(resource.type, "w-5 h-5 mr-2.5")}
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={resource.name}>
                            {resource.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 capitalize">
                          Type: {resource.type} • Location: {resource.location}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Quantity: <span className="font-bold text-lg">{resource.quantity}</span>
                          </p>
                          <div className="flex items-center">
                            <span className={`w-2.5 h-2.5 rounded-full mr-2 ${STATUS_STYLES[resource.status]?.dot}`}></span>
                            <p className={`text-xs font-semibold capitalize ${STATUS_STYLES[resource.status]?.text}`}>
                              {resource.status.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Search className="w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-lg text-slate-500 dark:text-slate-400">No resources found.</p>
                  {searchQuery && <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search criteria.</p>}
                </div>
              )}
            </div>

            {/* Sidebar: Allocated Resources */}
            <aside className="w-full lg:w-1/4 space-y-6 lg:sticky lg:top-24 self-start"> {/* self-start pour aligner avec le haut de la section principale */}
              <Card className="bg-white dark:bg-slate-800/70 p-6 rounded-xl shadow-lg border border-transparent dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-5 pb-3 border-b border-slate-200 dark:border-slate-700">
                  My Allocated Resources
                </h2>
                {STATIC_ALLOCATED_RESOURCES.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center">No resources currently allocated to you.</p>
                ) : (
                  <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1 -mr-2"> {/* Ajustement du scroll */}
                    {STATIC_ALLOCATED_RESOURCES.map((resource) => (
                      <Card key={resource._id} className="p-4 bg-slate-100 dark:bg-slate-700/60 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-1">
                          {getResourceIcon(resource.type, "w-4 h-4 mr-2")} {/* Icônes plus petites ici */}
                          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200">{resource.name}</h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">
                          Type: {resource.type}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 ml-6">
                          Location: {resource.location}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </aside>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}