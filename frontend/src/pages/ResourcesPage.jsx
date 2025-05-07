import { Card } from "@/components/ui/card";
import { PlusCircle, Database, CheckCircle, AlertOctagon, Trash2, Edit2 } from "lucide-react";
import { Link as LinkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import "../App.css";

const STATUS_COLORS = {
  available: "#00C49F",
  "in-maintenance": "#FFBB28",
};

const RESOURCE_TYPES = [
  { value: "bed", label: "Bed" },
  { value: "icu", label: "ICU" },
  { value: "ct-scan", label: "CT Scan" },
  { value: "x-ray", label: "X-Ray" },
  { value: "ventilator", label: "Ventilator" },
];

export default function ResourcesPage() {
  const [patients, setPatients] = useState([]);
  const [allocatingId, setAllocatingId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    type: "",
    name: "",
    quantity: 1,
    location: "",
    status: "available",
  });
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  // Fetch resources and patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resR, resP] = await Promise.all([
          axios.get("http://localhost:8089/api/resources", { withCredentials: true }),
          axios.get("http://localhost:8089/api/users/patients", { withCredentials: true }),
        ]);
        setResources(resR.data);
        setPatients(resP.data);
      } catch {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const unassigned = patients.filter(
    (p) => !resources.some((r) => r.allocatedTo === p._id)
  );

  // Stats calculations
  const totalCount = resources.length;
  const statusCounts = resources.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "quantity" ? Number(value) : value }));
  };

  // Show/hide add/edit form
  const toggleForm = () => {
    setEditingId(null);
    setForm({ type: "", name: "", quantity: 1, location: "", status: "available" });
    document.getElementById('resource-form').classList.toggle('hidden');
  };

  // Edit resource
  const handleEdit = (resource) => {
    setEditingId(resource._id);
    setForm({
      type: resource.type,
      name: resource.name,
      quantity: resource.quantity,
      location: resource.location,
      status: resource.status,
    });
    document.getElementById('resource-form').classList.remove('hidden');
  };

  // Delete confirmation
  const confirmDelete = (id) => setDeleteModal({ show: true, id });
  const cancelDelete = () => setDeleteModal({ show: false, id: null });
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:8089/api/resources/${deleteModal.id}`, { withCredentials: true });
      setResources((prev) => prev.filter((r) => r._id !== deleteModal.id));
    } catch {
      alert('Error deleting resource.');
    }
    cancelDelete();
  };

  // Allocate resource to patient
  const handleAllocate = (r) => {
    setAllocatingId(r._id);
    setSelectedPatient(r.allocatedTo || "");
    document.getElementById('allocate-form').classList.remove('hidden');
  };
  const cancelAllocate = () => {
    setAllocatingId(null);
    document.getElementById('allocate-form').classList.add('hidden');
  };
  const submitAllocate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:8089/api/resources/${allocatingId}/allocate`,
        { patientId: selectedPatient },
        { withCredentials: true }
      );
      const res = await axios.get("http://localhost:8089/api/resources", { withCredentials: true });
      setResources(res.data);
    } catch {
      alert("Error allocating resource");
    }
    cancelAllocate();
  };
  const recommendAllocate = async (patientId) => {
    try {
      // Call recommend endpoint
      const { data } = await axios.post(
        `http://localhost:8089/api/patients/${patientId}/recommend`,
        {},
        { withCredentials: true }
      );
      const topType = data.recommendations;
      console.log("Top recommendation:", topType);
      // Find and allocate resource
      const resource = resources.find(
        (r) => r.type === topType && r.status === "available"
      );
      if (!resource) {
        return alert(`No available resource of type ${topType}`);
      }
      await axios.post(
        `http://localhost:8089/api/resources/${resource._id}/allocate`,
        { patientId },
        { withCredentials: true }
      );
      // Refresh resources
      const res = await axios.get(
        "http://localhost:8089/api/resources",
        { withCredentials: true }
      );
      setResources(res.data);
      alert(`Allocated ${topType} to patient.`);
    } catch {
      alert("Error recommending or allocating");
    }
  };
  // Create or update resource
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axios.put(
          `http://localhost:8089/api/resources/${editingId}`,
          form,
          { withCredentials: true }
        );
        setResources((prev) => prev.map((r) => (r._id === editingId ? res.data : r)));
      } else {
        const res = await axios.post(
          "http://localhost:8089/api/resources",
          form,
          { withCredentials: true }
        );
        setResources((prev) => [...prev, res.data]);
      }
      document.getElementById('resource-form').classList.add('hidden');
      setEditingId(null);
      setForm({ type: "", name: "", quantity: 1, location: "", status: "available" });
    } catch {
      alert(editingId ? 'Error updating resource.' : 'Error creating resource.');
    }
  };

  if (loading) return <div>Loading resources...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="flex items-start space-x-6">
      {/* Main content */}
      <div className="w-3/4 space-y-6 relative">
        {/* Allocate Modal */}
        {allocatingId && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10"
            id="allocate-form"
          >
            <Card className="p-6 z-20">
              <h3 className="text-lg font-semibold mb-4">Allocate to Patient</h3>
              <form onSubmit={submitAllocate} className="space-y-4">
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="border p-2 w-full"
                  required
                >
                  <option value="" disabled>Select patient</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.username} ({p.email})
                    </option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={cancelAllocate}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                  >
                    Allocate
                  </button>
                </div>
              </form>
            </Card>
          </div>
        )}
  
        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <Card className="p-6 z-20">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p className="mb-4">Are you sure you want to delete this resource?</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </Card>
          </div>
        )}
  
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-blue-900">Resources Management</h1>
          <button
            onClick={toggleForm}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            <PlusCircle className="w-6 h-6" />
            {editingId ? 'Edit Resource' : 'Add Resource'}
          </button>
        </div>
  
        {/* Add/Edit Form */}
        <Card className="p-6 hidden" id="resource-form">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="border p-2"
                required
              >
                <option value="" disabled>Select resource type</option>
                {RESOURCE_TYPES.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
              <input
                name="name"
                placeholder="Name (e.g., ICU Bed 1)"
                value={form.name}
                onChange={handleChange}
                className="border p-2"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input type="number" name="quantity" min={1} placeholder="Quantity" value={form.quantity} onChange={handleChange} className="border p-2" required />
              <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="border p-2" required />
              <select name="status" value={form.status} onChange={handleChange} className="border p-2">
                <option value="available">Available</option>
                <option value="in-maintenance">In Maintenance</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {editingId ? 'Update Resource' : 'Create Resource'}
            </button>
          </form>
        </Card>
  
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Resources</p>
                <h3 className="text-2xl font-bold text-blue-900">{totalCount}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <h3 className="text-2xl font-bold text-blue-900">{statusCounts.available}</h3>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <AlertOctagon className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Maintenance</p>
                <h3 className="text-2xl font-bold text-blue-900">{statusCounts['in-maintenance']}</h3>
              </div>
            </div>
          </Card>
        </div>
  
        {/* Pie Chart */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Resource Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
  
        {/* Resource Table */}
        <Card className="p-6">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Location</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="px-4 py-2">{r.type}</td>
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2">{r.quantity}</td>
                  <td className="px-4 py-2">{r.location}</td>
                  <td className="px-4 py-2 capitalize">{r.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => handleEdit(r)} className="p-2 hover:bg-gray-100 rounded">
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </button>
                    <button onClick={() => confirmDelete(r._id)} className="p-2 hover:bg-gray-100 rounded">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                    <button onClick={() => handleAllocate(r)} className="p-2 hover:bg-gray-100 rounded">
                      <LinkIcon className="w-5 h-5 text-purple-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
  
      {/* Sidebar: Unassigned Patients (right side) */}
      <div className="w-1/4 space-y-4">
        <h2 className="text-xl font-semibold">Unassigned Patients</h2>
        {unassigned.map((p) => (
          <Card key={p._id} className="p-4">
            <div className="flex flex-col space-y-3">
              <div className="overflow-hidden">
                <p className="font-medium truncate">{p.username}</p>
                <p className="text-sm text-gray-600 truncate">{p.email}</p>
              </div>
              <button
                onClick={() => recommendAllocate(p._id)}
                className="px-2 py-1 bg-purple-600 text-white rounded-lg text-sm w-full"
              >
                Recommend & Allocate
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
  
}