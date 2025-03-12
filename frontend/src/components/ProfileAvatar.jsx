import React from 'react';
import { UserRound } from 'lucide-react';

const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
};

const ProfileAvatar = ({ imageUrl, altText, size = 'lg' }) => {
    return (
        <div className={`profile-avatar ${sizes[size]} rounded-full overflow-hidden animate-fade-in`}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={altText}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#42A5FF]/20">
                    <UserRound
                        className="text-[#42A5FF]"
                        size={size === 'xl' ? 64 : size === 'lg' ? 48 : size === 'md' ? 36 : 24}
                    />
                </div>
            )}
        </div>
    );
};

export default ProfileAvatar;