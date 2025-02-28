import React from 'react';
import { motion } from 'framer-motion';

const TabNavigation = ({
    tabs,
    activeTab,
    onTabChange
}) => {
    return (
        <div className="flex space-x-1 border-b">
            {tabs.map((tab) => {
                const isActive = activeTab === tab;

                return (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`profile-tab ${isActive ? 'profile-tab-active' : ''}`}
                    >
                        <span className="capitalize">
                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Information
                        </span>

                        {isActive && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-profileBlue-400"
                                layoutId="activeTab"
                                initial={false}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default TabNavigation;