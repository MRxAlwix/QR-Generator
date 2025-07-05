import React from 'react';
import { Heart, Github, Twitter, Star, Shield, Zap, Smartphone, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  const features = [
    { icon: Shield, text: '100% Secure & Private' },
    { icon: Zap, text: 'Lightning Fast Generation' },
    { icon: Smartphone, text: 'All Device Compatible' },
    { icon: Globe, text: '9+ Format Support' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-50 to-white border-t border-gray-200/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Features Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-3 shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-700">{feature.text}</p>
              </div>
            );
          })}
        </div>

        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                QR Generator Pro
              </h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Generator QR Code profesional dengan teknologi terdepan. 
              Buat QR code berkualitas tinggi untuk berbagai keperluan bisnis dan personal.
            </p>
          </div>

          {/* Features */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-gray-900 mb-4">Fitur Unggulan</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 9+ Format QR Code</li>
              <li>• Kustomisasi Warna & Ukuran</li>
              <li>• Riwayat & Template</li>
              <li>• Export High Quality</li>
              <li>• Kompatibel Semua Device</li>
            </ul>
          </div>

          {/* Stats */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-gray-900 mb-4">Statistik</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">99.9% Uptime</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Unlimited Generation</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">No Registration Required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-600">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>for the community</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-200 transform hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-blue-500 transition-colors duration-200 transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2024 QR Generator Pro. All rights reserved.
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center space-x-8 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Fast Processing</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>Privacy Focused</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;