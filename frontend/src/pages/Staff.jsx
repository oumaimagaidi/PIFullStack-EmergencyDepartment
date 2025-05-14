// src/pages/Staff.jsx
import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Search, UserCircle, BadgeCheck, Mail, Phone, Briefcase, Users, ChevronLeft, ChevronRight, Settings2, Stethoscope, Activity, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null; 

    const pageNumbers = [];
    const maxPagesToShow = 5; 
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfPagesToShow);
    let endPage = Math.min(totalPages, currentPage + halfPagesToShow);

    if (currentPage - halfPagesToShow <= 0) {
        endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage + halfPagesToShow >= totalPages) {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    if (totalPages < maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    
    const inactiveButtonClass = "hover:bg-[#ECEFCA]/50 text-[#547792] dark:text-[#94B4C1]";
    const ellipsisClass = "px-2 py-1 text-sm text-[#547792] dark:text-[#94B4C1]";


    return (
        <div className="flex justify-center items-center space-x-1 mt-8">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="hover:bg-[#ECEFCA]/50 text-[#213448] dark:text-[#ECEFCA] border-[#94B4C1]"
            >
                <ChevronLeft className="h-4 w-4" />
                Previous
            </Button>

            {startPage > 1 && (
                <>
                    <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} className={inactiveButtonClass}>1</Button>
                    {startPage > 2 && <span className={ellipsisClass}>...</span>}
                </>
            )}

            {pageNumbers.map(number => (
                <Button
                    key={number}
                    
                    variant={currentPage === number ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => onPageChange(number)}
                    className={`${
                        currentPage === number 
                            ? "bg-[#547792] hover:bg-[#213448] text-[#ECEFCA] cursor-default shadow-md" 
                            : inactiveButtonClass 
                    } font-medium rounded-md transition-all duration-200`} 
                >
                    {number}
                </Button>
            ))}

            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && <span className={ellipsisClass}>...</span>}
                    <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} className={inactiveButtonClass}>{totalPages}</Button> 
                  
                </>
            )}

            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="hover:bg-[#ECEFCA]/50 text-[#213448] dark:text-[#ECEFCA] border-[#94B4C1]"
            >
                Next
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
};



const StaffDirectory = ({ staffMembers, searchQuery, onSearchChange, onDoctorAvailabilityChange, currentPage, itemsPerPage, onPageChange }) => {
    
    const getRoleStyle = (role) => {
        switch (role) {
            case "Doctor":
                return { 
                    badgeClass: "bg-[#94B4C1]/20 text-[#213448] dark:bg-[#94B4C1]/30 dark:text-[#ECEFCA] border-[#94B4C1] dark:border-[#94B4C1]",
                    icon: <Stethoscope className="w-4 h-4 mr-1.5 text-[#547792] dark:text-[#94B4C1]" />,
                    titleColor: "text-[#213448] dark:text-[#ECEFCA]"
                };
            case "Nurse":
                return { 
                    badgeClass: "bg-[#DDA853]/20 text-[#213448] dark:bg-[#DDA853]/30 dark:text-[#ECEFCA] border-[#DDA853] dark:border-[#DDA853]",
                    icon: <Activity className="w-4 h-4 mr-1.5 text-[#DDA853] dark:text-[#DDA853]" />,
                    titleColor: "text-[#213448] dark:text-[#ECEFCA]"
                };
            default:
                return { 
                    badgeClass: "bg-[#ECEFCA]/50 text-[#213448] dark:bg-[#ECEFCA]/20 dark:text-[#ECEFCA] border-[#94B4C1] dark:border-[#94B4C1]",
                    icon: <Briefcase className="w-4 h-4 mr-1.5 text-[#547792]" />,
                    titleColor: "text-[#213448] dark:text-[#ECEFCA]"
                };
        }
    };
    
    const getAvailabilityStyle = (isAvailable) => {
        return isAvailable
            ? { text: "Available", color: "text-[#94B4C1] dark:text-[#94B4C1]", Icon: ToggleRight, dotColor: "bg-[#94B4C1] dark:bg-[#94B4C1]" }
            : { text: "Occupied", color: "text-[#DDA853] dark:text-[#DDA853]", Icon: ToggleLeft, dotColor: "bg-[#DDA853] dark:bg-[#DDA853]" };
    };

    const filteredStaff = useMemo(() => staffMembers.filter(staff =>
        staff.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staff.specialization && staff.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (staff.role && staff.role.toLowerCase().includes(searchQuery.toLowerCase()))
    ), [staffMembers, searchQuery]);

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
    const paginatedStaff = useMemo(() => 
        filteredStaff.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    , [filteredStaff, currentPage, itemsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            onPageChange(totalPages);
        } else if (currentPage <= 0 && totalPages > 0) { 
             onPageChange(1);
        } else if (filteredStaff.length > 0 && currentPage === 0 && totalPages === 0){ 
            onPageChange(1); 
        }
    }, [currentPage, totalPages, onPageChange, filteredStaff.length]);


    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-3"> 
            <CardHeader className="p-0 mb-6"> 
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                     <div>
                        
                        <p className="text-[#547792] dark:text-[#94B4C1] mt-1 text-sm">
                            Browse and manage medical personnel. Total: {filteredStaff.length}
                        </p>
                     </div>
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#547792] dark:text-[#94B4C1]" />
                        <Input
                            placeholder="Search by name, role, specialty..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-lg w-full md:w-80 bg-white dark:bg-[#213448] border-[#94B4C1]/30 dark:border-[#547792] focus:ring-[#547792] focus:border-[#547792] shadow-sm"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0"> 
                <AnimatePresence>
                    {paginatedStaff.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-[#547792] dark:text-[#94B4C1] py-16 bg-white dark:bg-[#213448]/30 rounded-xl border border-dashed border-[#94B4C1]/30 dark:border-[#547792]"
                        >
                            <Users className="h-16 w-16 mx-auto text-[#94B4C1] dark:text-[#547792] mb-4" />
                            <p className="text-xl font-medium">No Staff Members Found</p>
                            <p className="text-sm">Try adjusting your search or filter criteria.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"> 
                            {paginatedStaff.map((staff, index) => {
                                const roleStyle = getRoleStyle(staff.role);
                                const availability = staff.role === "Doctor" ? getAvailabilityStyle(staff.isAvailable) : null;
                                return (
                                    <motion.div
                                        key={staff._id}
                                        layout 
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="bg-white dark:bg-[#213448] shadow-lg hover:shadow-xl rounded-xl border border-[#94B4C1]/30 dark:border-[#547792] overflow-hidden flex flex-col transition-all duration-300"
                                    >
                                        <div className={`h-2 ${roleStyle.badgeClass.split(' ')[0].replace('bg-', 'border-b-4 border-')}`}></div>
                                        
                                        <div className="p-5 flex-grow">
                                            <div className="flex items-center gap-4 mb-4">
                                                {staff.profileImage ? (
                                                    <img src={`http://localhost:8089${staff.profileImage.startsWith('/') ? staff.profileImage : '/' + staff.profileImage }`} alt={staff.username} className="h-16 w-16 rounded-full object-cover border-2 border-[#94B4C1]/30 dark:border-[#547792] shadow-sm" />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-full bg-[#ECEFCA]/30 dark:bg-[#213448] flex items-center justify-center text-[#547792] dark:text-[#94B4C1] border-2 border-[#94B4C1]/30 dark:border-[#547792]">
                                                        <UserCircle className="h-10 w-10" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className={`font-bold text-xl ${roleStyle.titleColor} truncate`}>{staff.username}</h3>
                                                        {staff.isValidated && <BadgeCheck className="h-5 w-5 text-[#94B4C1] dark:text-[#94B4C1]" title="Validated Account" />}
                                                    </div>
                                                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center mt-1 ${roleStyle.badgeClass}`}>
                                                        {roleStyle.icon}
                                                        {staff.role}
                                                    </span>
                                                </div>
                                            </div>

                                            {staff.specialization && (
                                                <p className="text-sm text-[#213448] dark:text-[#ECEFCA] mb-1 flex items-center">
                                                    <Stethoscope className="w-4 h-4 mr-2 text-[#547792] dark:text-[#94B4C1]" />
                                                    Specialty: {staff.specialization}
                                                </p>
                                            )}
                                             {staff.shift && staff.role === "Nurse" && (
                                                <p className="text-sm text-[#213448] dark:text-[#ECEFCA] mb-1 flex items-center">
                                                    <Clock className="w-4 h-4 mr-2 text-[#547792] dark:text-[#94B4C1]" /> 
                                                    Shift: {staff.shift}
                                                </p>
                                            )}


                                            <div className="mt-3 pt-3 border-t border-[#94B4C1]/30 dark:border-[#547792] space-y-1.5 text-xs text-[#547792] dark:text-[#94B4C1]">
                                                <p className="flex items-center gap-2 hover:text-[#213448] dark:hover:text-[#ECEFCA] transition-colors">
                                                    <Mail className="h-4 w-4" />
                                                    {staff.email}
                                                </p>
                                                <p className="flex items-center gap-2 hover:text-[#213448] dark:hover:text-[#ECEFCA] transition-colors">
                                                    <Phone className="h-4 w-4" />
                                                    {staff.phoneNumber}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-4 bg-[#ECEFCA]/10 dark:bg-[#213448]/70 border-t border-[#94B4C1]/30 dark:border-[#547792] mt-auto">
                                            {staff.role === "Doctor" && availability && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="w-full flex items-center justify-center gap-2 cursor-pointer group hover:border-[#547792]/50 dark:hover:border-[#94B4C1]/50 dark:bg-[#213448] dark:text-[#ECEFCA] dark:hover:bg-[#213448]/80 border-[#94B4C1]/30" 
                                                    onClick={() => onDoctorAvailabilityChange(staff._id, !staff.isAvailable)} 
                                                    title="Click to toggle availability"
                                                >
                                                    <span className={`w-2.5 h-2.5 rounded-full ${availability.dotColor} transition-all group-hover:ring-2 group-hover:ring-offset-1 dark:group-hover:ring-offset-[#213448] ${availability.dotColor === 'bg-[#94B4C1]' ? 'group-hover:ring-[#94B4C1]/30' : 'group-hover:ring-[#DDA853]/30'}`}></span>
                                                    <span className={`text-xs font-medium ${availability.color}`}>
                                                        {availability.text}
                                                    </span>
                                                    <availability.Icon className={`w-5 h-5 ${availability.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                                                </Button>
                                            )}
                                            {staff.role !== "Doctor" && (
                                                <div className="text-center">
                                                    <span className="text-xs text-[#547792] dark:text-[#94B4C1] italic">Availability N/A</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </CardContent>
            {totalPages > 1 && (
                <CardFooter className="p-6 border-t border-[#94B4C1]/30 dark:border-[#547792]">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
                </CardFooter>
            )}
        </div>
    );
};


const Staff = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [staffMembers, setStaffMembers] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [staffError, setStaffError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const staffItemsPerPage = 6; 


    const fetchStaff = async () => {
        setLoadingStaff(true);
        setStaffError(null);
        try {
            const doctorsResponse = await axios.get('http://localhost:8089/api/users/doctors', { withCredentials: true });
            const nursesResponse = await axios.get('http://localhost:8089/api/users/nurses', { withCredentials: true }); 
            
            const doctorsWithAvailability = doctorsResponse.data.map(staff => ({
                ...staff,
                role: 'Doctor', 
                isAvailable: staff.isAvailable === undefined ? true : staff.isAvailable
            }));

            const nurses = nursesResponse.data.map(staff => ({
                ...staff,
                role: 'Nurse', 
            }));

            setStaffMembers([...doctorsWithAvailability, ...nurses].sort((a,b) => a.username.localeCompare(b.username)));

        } catch (error) {
            console.error("Error fetching staff:", error);
            setStaffError("Failed to load staff data. Please try again later.");
        } finally {
            setLoadingStaff(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleDoctorAvailabilityChange = async (doctorId, newAvailability) => {
        const originalStaffMembers = [...staffMembers];
        setStaffMembers(prevStaff => prevStaff.map(staff =>
            staff._id === doctorId ? { ...staff, isAvailable: newAvailability } : staff
        ));
        try {
            const response = await axios.put(`http://localhost:8089/api/users/${doctorId}/availability`,
             { isAvailable: newAvailability },
             { withCredentials: true }
            );
            toast.success(response.data.message || `Doctor's availability updated successfully.`);
        } catch (error) {
            console.error("Error updating doctor availability:", error);
            toast.error(`Failed to update availability: ${error.response?.data?.message || error.message}`);
            setStaffMembers(originalStaffMembers);
        }
    };
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ECEFCA]/30 to-[#94B4C1]/20 dark:from-[#213448] dark:to-[#547792]/30 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <header className="mb-8 md:mb-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#213448] dark:text-[#ECEFCA] tracking-tight">
                    Staff Management
                </h1>
                    <Sheet>
                         <SheetTrigger asChild>
                         <Button className="bg-[#547792] hover:bg-[#213448] text-[#ECEFCA] shadow-md hover:shadow-lg transition-all duration-300 gap-2 px-5 py-2.5 rounded-lg">
                            <Plus className="h-4.5 w-4.5" />
                            Add Staff
                        </Button>
                         </SheetTrigger>
                         <SheetContent className="bg-white dark:bg-[#213448] border-l dark:border-[#547792] w-full sm:max-w-md">
                             <SheetHeader className="p-6 border-b dark:border-[#547792]">
                                 <SheetTitle className="text-xl font-semibold text-[#213448] dark:text-[#ECEFCA]">Add New Staff Member</SheetTitle>
                             </SheetHeader>
                             <div className="p-6 space-y-5">
                                 {/* Formulaire à implémenter ici */}
                                 <Input placeholder="Full Name" className="dark:bg-[#213448] dark:border-[#547792] dark:text-[#ECEFCA] focus:ring-[#547792] focus:border-[#547792]" />
                                 <Input placeholder="Role (e.g., Doctor, Nurse)" className="dark:bg-[#213448] dark:border-[#547792] dark:text-[#ECEFCA] focus:ring-[#547792] focus:border-[#547792]" />
                                 <Input placeholder="Specialization/Department" className="dark:bg-[#213448] dark:border-[#547792] dark:text-[#ECEFCA] focus:ring-[#547792] focus:border-[#547792]" />
                                 <Input placeholder="Email" type="email" className="dark:bg-[#213448] dark:border-[#547792] dark:text-[#ECEFCA] focus:ring-[#547792] focus:border-[#547792]" />
                                 <Input placeholder="Phone Number" type="tel" className="dark:bg-[#213448] dark:border-[#547792] dark:text-[#ECEFCA] focus:ring-[#547792] focus:border-[#547792]" />
                                 <Button className="w-full bg-[#547792] hover:bg-[#213448] text-[#ECEFCA] py-3 rounded-lg">Add Staff Member</Button>
                             </div>
                         </SheetContent>
                     </Sheet>
                </div>
                 <p className="mt-2 text-base text-[#547792] dark:text-[#94B4C1] max-w-2xl">
                    Oversee medical personnel, manage roles, and ensure optimal staffing levels for quality patient care.
                </p>
            </header>
            
            <div className="mt-8">
                 {loadingStaff && 
                    <div className="flex flex-col justify-center items-center py-20 space-y-4">
                        <svg className="animate-spin h-10 w-10 text-[#547792]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-[#213448] dark:text-[#ECEFCA] text-lg font-medium">Loading staff members...</p>
                    </div>
                 }
                 {staffError && 
                    <div className="text-center bg-[#DDA853]/10 dark:bg-[#DDA853]/20 p-6 rounded-xl border border-[#DDA853]/30 dark:border-[#DDA853]/50">
                        <Settings2 className="h-12 w-12 mx-auto text-[#DDA853] dark:text-[#DDA853] mb-3" /> 
                        <p className="text-xl font-medium text-[#213448] dark:text-[#ECEFCA]">Failed to Load Staff</p>
                        <p className="text-sm text-[#547792] dark:text-[#94B4C1] mt-1">{staffError}</p>
                        <Button onClick={fetchStaff} variant="outline" className="mt-4 border-[#DDA853] text-[#213448] hover:bg-[#DDA853]/20 dark:border-[#DDA853] dark:text-[#ECEFCA] dark:hover:bg-[#DDA853]/30">
                            Retry
                        </Button>
                    </div>
                 }
                 {!loadingStaff && !staffError && (
                     <StaffDirectory
                         staffMembers={staffMembers}
                         searchQuery={searchQuery}
                         onSearchChange={setSearchQuery}
                         onDoctorAvailabilityChange={handleDoctorAvailabilityChange}
                         currentPage={currentPage}
                         itemsPerPage={staffItemsPerPage}
                         onPageChange={handlePageChange}
                    />
                 )}
            </div>
        </div>
    );
};

export default Staff;
