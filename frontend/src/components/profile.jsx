import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import ProfileHeader from './ProfileHeader';  // Assuming this is a separate file
import ProfileContent from './ProfileContent'; // Assuming this is a separate file
import LoadingState from './LoadingState'; // Assuming this is a separate file
import { toast } from 'sonner';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    personal: {},
    medical: {},
    professional: {}
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  const handleSave = async () => {
    try {
      const token = Cookies.get("token");
      const response = await axios.put('http://localhost:8089/api/profile', profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const updatedData = response.data;
        setProfileData(updatedData);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error saving changes');
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
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ProfileHeader 
        username={profileData.personal.username} 
        role={profileData.personal.role} 
      />
      
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

export default Profile;
