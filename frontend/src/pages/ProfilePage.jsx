import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import ProfileHeader from '../components/ProfileHeader';
import ProfileContent from '../components/ProfileContent';
import LoadingState from '../components/LoadingState';

const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [profileData, setProfileData] = useState({
        personal: {},
        medical: {},
        professional: {}
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Simulate the API response with dummy data
    useEffect(() => {
        const mockData = {
            personal: {
                username: 'John Appleseed',
                role: 'Doctor',
                email: 'john.appleseed@example.com',
                phone: '+1 (555) 123-4567',
                address: '123 Apple Park Way, Cupertino, CA',
                dateOfBirth: '1980-05-15'
            },
            medical: {},
            professional: {
                department: 'Cardiology',
                specialization: 'Interventional Cardiology',
                experience: '15 years',
                education: 'Stanford Medical School',
                certifications: ['ABIM', 'FACC'],
                languages: ['English', 'Spanish']
            }
        };

        // Simulate API call
        setTimeout(() => {
            setProfileData(mockData);
            setLoading(false);
        }, 1500);

        /* Actual API Call (commented out)
        const token = Cookies.get("token");
        
        axios.get('http://localhost:8089/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(response => {
          setProfileData(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error:', error);
          setError('Error loading profile');
          setLoading(false);
        });
        */
    }, []);

    const handleSave = async () => {
        try {
            setLoading(true);

            // Simulating API call for demo
            await new Promise(resolve => setTimeout(resolve, 800));

            /* Actual API Call (commented out)
            const token = Cookies.get("token");
            const response = await axios.put('http://localhost:8089/api/profile', profileData, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
      
            if (response.status === 200) {
              const updatedData = response.data;
              setProfileData(updatedData);
            } else {
              throw new Error('Failed to update profile');
            }
            */

            setIsEditing(false);
            setLoading(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error:', error);
            setError('Error saving changes');
            setLoading(false);
            toast.error('Failed to update profile');
        }
    };

    const handleEdit = (section, field, value) => {
        setProfileData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    if (loading) return <LoadingState />;

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <motion.div
                    className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="text-center">
                        <div className="bg-red-100 text-red-600 p-3 rounded-full inline-flex mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Profile</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-profileBlue-500 hover:bg-profileBlue-600 text-white font-medium py-2 px-4 rounded transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* SUPPRIMER ou commenter cette ligne */}
            {/* <ProfileHeader
                username={profileData.personal.username}
                role={profileData.personal.role}
            /> */}

            <div className="container -mt-16 relative z-30 pb-16">
                <ProfileContent
                    profileData={profileData}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    handleEdit={handleEdit}
                    handleSave={handleSave}
                />
            </div>
        </div>
    );
};

export default ProfilePage;
