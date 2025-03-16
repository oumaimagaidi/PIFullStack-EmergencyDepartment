import React from 'react';

const LoadingState = () => {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-profileBlue-400 to-profileTeal-400 animate-pulse-slow"></div>
                    <div className="absolute inset-1 rounded-full bg-white"></div>
                    <div className="absolute inset-3 rounded-full bg-gradient-to-r from-profileBlue-400 to-profileTeal-400 animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-5 rounded-full bg-white"></div>
                    <div className="absolute inset-7 rounded-full bg-gradient-to-r from-profileBlue-500 to-profileTeal-500 animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="h-2 w-32 bg-gray-200 rounded overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-profileBlue-400 to-profileTeal-400 animate-shimmer"></div>
                    </div>
                    <h3 className="text-profileBlue-600 font-medium mt-3">Loading your profile</h3>
                    <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
                </div>
            </div>
        </div>
    );
};

export default LoadingState;
