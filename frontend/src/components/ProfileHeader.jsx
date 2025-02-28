import React from 'react';
import ProfileAvatar from './ProfileAvatar';
import { motion } from 'framer-motion';

const ProfileHeader = ({ username = 'User', role }) => {
  return (
    <div className="relative h-64 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-profile-gradient"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-[20%] left-[5%] h-32 w-32 rounded-full bg-white opacity-5"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute bottom-[10%] right-[15%] h-24 w-24 rounded-full bg-white opacity-10"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
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
        <div className="h-full flex items-center">
          <div className="flex items-center space-x-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProfileAvatar size="xl" altText={username} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-white"
            >
              <div className="text-sm font-medium text-profileBlue-100 mb-1">Welcome,</div>
              <h1 className="text-3xl font-bold">
                {username}
              </h1>
              {role && (
                <div className="mt-1 inline-block px-3 py-1 rounded-full bg-white bg-opacity-20 backdrop-blur-xs text-sm font-medium">
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
