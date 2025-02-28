
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-profileBlue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">PiFullStack</Link>
                <nav>
                    <ul className="flex space-x-4">
                        <li><Link to="/" className="hover:text-profileBlue-200">Accueil</Link></li>
                        <li><Link to="/profile" className="hover:text-profileBlue-200">Profil</Link></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
