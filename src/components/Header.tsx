import React from 'react';
import { Upload } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Upload className="h-8 w-8 text-blue-500" />
            <h1 className="ml-2 text-2xl font-bold text-gray-900">ImageHost</h1>
          </div>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a 
                  href="#" 
                  className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                >
                  Upload
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
                >
                  Gallery
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;