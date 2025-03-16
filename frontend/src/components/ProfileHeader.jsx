import React from 'react';
import ProfileAvatar from './ProfileAvatar';
import { motion } from 'framer-motion';

const ProfileHeader = ({ username = 'User', role, profileImage }) => {
  return (
    <div className="relative h-72 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#42A5FF] to-[#1E88E5]"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-[20%] left-[5%] h-32 w-32 rounded-full bg-white opacity-10"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute bottom-[10%] right-[15%] h-24 w-24 rounded-full bg-white opacity-15"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1 
          }}
        />
      </div>
      
      {/* Content */}
      <div className="profile-glass absolute inset-0 z-10"></div>
      <div className="container h-full relative z-20">
        <div className="h-full flex items-center pt-16"> {/* Ajout de `pt-16` pour déplacer vers le bas */}
          <div className="flex items-center space-x-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
                <ProfileAvatar 
                imageUrl={profileImage} 
                altText={username} 
                size="xl" 
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-white"
            >
              <div className="text-sm font-medium text-blue-100 mb-1">Welcome,</div>
              <h1 className="text-4xl font-bold text-white">
                {username}
              </h1>
              {role && (
                <div className="mt-2 inline-block px-4 py-1 rounded-full bg-[#6DDDCF]  backdrop-blur-sm text-sm font-medium text-white">
                  {role}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;