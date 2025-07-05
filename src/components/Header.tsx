import React from 'react';
import { QrCode, Sparkles, Zap, Shield, Smartphone } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <QrCode className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                QR Generator Pro
              </h1>
              <p className="text-sm text-gray-600 font-medium">
                Professional QR Code Generator with Advanced Features
              </p>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                <Shield className="w-4 h-4" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                <Smartphone className="w-4 h-4" />
                <span>All Devices</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-full font-medium">
                <Zap className="w-4 h-4" />
                <span>Instant Generate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;