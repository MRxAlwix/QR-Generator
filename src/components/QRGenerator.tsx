import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Download, Copy, Share2, RefreshCw, Link, Type, Mail, Phone, QrCode, 
  Check, AlertCircle, Settings, Palette, Zap, Shield, Smartphone,
  Eye, EyeOff, History, Star, Trash2, Save, Upload, Camera,
  Wifi, MapPin, Calendar, CreditCard, User, MessageSquare
} from 'lucide-react';
import * as QRCode from 'qrcode';

interface QROptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
}

interface QRHistory {
  id: string;
  type: string;
  content: string;
  timestamp: number;
  dataUrl: string;
  favorite: boolean;
}

interface QRTemplate {
  id: string;
  name: string;
  type: string;
  template: string;
  description: string;
}

const QRGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('url');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [history, setHistory] = useState<QRHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');
  const [options, setOptions] = useState<QROptions>({
    errorCorrectionLevel: 'H',
    width: 512,
    margin: 4,
    color: {
      dark: '#1f2937',
      light: '#ffffff'
    }
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrTypes = [
    { id: 'url', name: 'URL/Website', icon: Link, placeholder: 'https://example.com', color: 'bg-blue-500' },
    { id: 'text', name: 'Plain Text', icon: Type, placeholder: 'Enter your text here', color: 'bg-green-500' },
    { id: 'email', name: 'Email', icon: Mail, placeholder: 'user@example.com', color: 'bg-red-500' },
    { id: 'phone', name: 'Phone', icon: Phone, placeholder: '+1234567890', color: 'bg-yellow-500' },
    { id: 'wifi', name: 'WiFi', icon: Wifi, placeholder: 'WIFI:T:WPA;S:NetworkName;P:Password;;', color: 'bg-purple-500' },
    { id: 'location', name: 'Location', icon: MapPin, placeholder: 'geo:37.7749,-122.4194', color: 'bg-pink-500' },
    { id: 'event', name: 'Calendar Event', icon: Calendar, placeholder: 'BEGIN:VEVENT...', color: 'bg-indigo-500' },
    { id: 'contact', name: 'Contact Card', icon: User, placeholder: 'BEGIN:VCARD...', color: 'bg-teal-500' },
    { id: 'sms', name: 'SMS', icon: MessageSquare, placeholder: 'sms:+1234567890:Hello!', color: 'bg-orange-500' }
  ];

  const templates: QRTemplate[] = [
    {
      id: 'wifi-template',
      name: 'WiFi Network',
      type: 'wifi',
      template: 'WIFI:T:WPA;S:[NETWORK_NAME];P:[PASSWORD];;',
      description: 'Share WiFi credentials easily'
    },
    {
      id: 'contact-template',
      name: 'Business Card',
      type: 'contact',
      template: 'BEGIN:VCARD\nVERSION:3.0\nFN:[FULL_NAME]\nORG:[COMPANY]\nTEL:[PHONE]\nEMAIL:[EMAIL]\nURL:[WEBSITE]\nEND:VCARD',
      description: 'Digital business card'
    },
    {
      id: 'event-template',
      name: 'Calendar Event',
      type: 'event',
      template: 'BEGIN:VEVENT\nSUMMARY:[EVENT_NAME]\nDTSTART:[START_DATE]\nDTEND:[END_DATE]\nLOCATION:[LOCATION]\nDESCRIPTION:[DESCRIPTION]\nEND:VEVENT',
      description: 'Add event to calendar'
    },
    {
      id: 'location-template',
      name: 'Location Pin',
      type: 'location',
      template: 'geo:[LATITUDE],[LONGITUDE]',
      description: 'Share exact location'
    }
  ];

  const colorPresets = [
    { name: 'Classic', dark: '#000000', light: '#ffffff' },
    { name: 'Ocean', dark: '#0ea5e9', light: '#f0f9ff' },
    { name: 'Forest', dark: '#059669', light: '#f0fdf4' },
    { name: 'Sunset', dark: '#dc2626', light: '#fef2f2' },
    { name: 'Royal', dark: '#7c3aed', light: '#faf5ff' },
    { name: 'Gold', dark: '#d97706', light: '#fffbeb' }
  ];

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('qr-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
        localStorage.removeItem('qr-history');
      }
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = useCallback((qrData: Omit<QRHistory, 'id' | 'timestamp' | 'favorite'>) => {
    const newEntry: QRHistory = {
      ...qrData,
      id: Date.now().toString(),
      timestamp: Date.now(),
      favorite: false
    };
    
    const updatedHistory = [newEntry, ...history.slice(0, 19)]; // Keep only 20 items
    setHistory(updatedHistory);
    localStorage.setItem('qr-history', JSON.stringify(updatedHistory));
  }, [history]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const generateQRCode = async () => {
    if (!text.trim()) {
      showNotification('error', '⚠️ Silakan masukkan konten terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    try {
      let qrText = text.trim();
      
      // Format text based on type
      switch (selectedType) {
        case 'email':
          qrText = text.includes('mailto:') ? text : `mailto:${text}`;
          break;
        case 'phone':
          qrText = text.includes('tel:') ? text : `tel:${text}`;
          break;
        case 'sms':
          if (!text.includes('sms:')) {
            qrText = `sms:${text}`;
          }
          break;
        case 'url':
          if (!text.startsWith('http://') && !text.startsWith('https://') && !text.startsWith('ftp://')) {
            qrText = `https://${text}`;
          }
          break;
        case 'location':
          if (!text.startsWith('geo:')) {
            qrText = `geo:${text}`;
          }
          break;
        default:
          qrText = text;
      }

      // Generate QR code using canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const qrOptions = {
          errorCorrectionLevel: options.errorCorrectionLevel,
          width: options.width,
          margin: options.margin,
          color: {
            dark: options.color.dark,
            light: options.color.light
          }
        };
        
        await QRCode.toCanvas(canvas, qrText, qrOptions);
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        setQrCodeUrl(dataUrl);
        
        // Save to history
        saveToHistory({
          type: selectedType,
          content: text,
          dataUrl
        });
        
        showNotification('success', '🎉 QR Code berhasil dibuat dan disimpan ke riwayat!');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      showNotification('error', '❌ Gagal membuat QR Code. Silakan periksa format input Anda.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateClick = () => {
    if (!text.trim()) {
      showNotification('error', '⚠️ Silakan masukkan konten terlebih dahulu');
      return;
    }
    generateQRCode();
  };

  // Auto-generate when text changes (with debounce)
  useEffect(() => {
    if (text.trim() && !showConfirmation) {
      const debounceTimer = setTimeout(() => {
        generateQRCode();
      }, 800);
      return () => clearTimeout(debounceTimer);
    } else if (!text.trim()) {
      setQrCodeUrl('');
    }
  }, [text, options, selectedType]);

  const downloadQRCode = (customName?: string) => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    const fileName = customName || `qr-${selectedType}-${new Date().toISOString().split('T')[0]}.png`;
    link.download = fileName;
    link.href = qrCodeUrl;
    link.click();
    showNotification('success', '📥 QR Code berhasil diunduh!');
  };

  const copyToClipboard = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      showNotification('success', '📋 QR Code berhasil disalin ke clipboard!');
    } catch (error) {
      // Fallback: copy as text
      try {
        await navigator.clipboard.writeText(text);
        showNotification('info', '📋 Konten QR Code disalin sebagai teks');
      } catch (fallbackError) {
        showNotification('error', '❌ Gagal menyalin ke clipboard');
      }
    }
  };

  const shareQRCode = async () => {
    if (!qrCodeUrl || !navigator.share) {
      showNotification('error', '❌ Fitur share tidak didukung di browser ini');
      return;
    }
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });
      
      await navigator.share({
        title: 'QR Code Generator',
        text: `QR Code untuk: ${text}`,
        files: [file]
      });
      showNotification('success', '📤 QR Code berhasil dibagikan!');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        showNotification('error', '❌ Gagal membagikan QR Code');
      }
    }
  };

  const loadFromHistory = (item: QRHistory) => {
    setText(item.content);
    setSelectedType(item.type);
    setQrCodeUrl(item.dataUrl);
    setShowHistory(false);
    setActiveTab('generator');
    showNotification('success', '📂 QR Code dimuat dari riwayat');
  };

  const toggleFavorite = (id: string) => {
    const updatedHistory = history.map(item => 
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
    setHistory(updatedHistory);
    localStorage.setItem('qr-history', JSON.stringify(updatedHistory));
  };

  const deleteFromHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('qr-history', JSON.stringify(updatedHistory));
    showNotification('success', '🗑️ Item dihapus dari riwayat');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('qr-history');
    showNotification('success', '🧹 Riwayat berhasil dibersihkan');
  };

  const useTemplate = (template: QRTemplate) => {
    setText(template.template);
    setSelectedType(template.type);
    setActiveTab('generator');
    showNotification('info', `📋 Template ${template.name} dimuat`);
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('success', '📤 Riwayat berhasil diekspor');
  };

  const importHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedHistory = JSON.parse(e.target?.result as string);
        setHistory([...importedHistory, ...history]);
        localStorage.setItem('qr-history', JSON.stringify([...importedHistory, ...history]));
        showNotification('success', '📥 Riwayat berhasil diimpor');
      } catch (error) {
        showNotification('error', '❌ File tidak valid');
      }
    };
    reader.readAsText(file);
  };

  const currentType = qrTypes.find(type => type.id === selectedType);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hidden Canvas for QR Generation */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl flex items-center space-x-3 transform transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
            : notification.type === 'error'
            ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
            : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Zap className="w-5 h-5" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
          <QrCode className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
          QR Code Generator Pro
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Buat QR code profesional dengan teknologi terdepan. Mendukung berbagai format, 
          dapat disesuaikan, dan kompatibel dengan semua device modern.
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-center space-x-8 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{history.length}</div>
            <div className="text-sm text-gray-500">QR Codes Dibuat</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">9+</div>
            <div className="text-sm text-gray-500">Format Didukung</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">100%</div>
            <div className="text-sm text-gray-500">Kompatibilitas</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200/50">
          <div className="flex space-x-2">
            {[
              { id: 'generator', name: 'Generator', icon: QrCode },
              { id: 'history', name: 'Riwayat', icon: History },
              { id: 'templates', name: 'Template', icon: Star }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'generator' && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* QR Type Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-indigo-600" />
                Pilih Tipe Konten
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {qrTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 group ${
                        selectedType === type.id
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${type.color} flex items-center justify-center mx-auto mb-2 ${
                        selectedType === type.id ? 'shadow-lg' : 'group-hover:shadow-md'
                      }`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-xs font-medium block">{type.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Input */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Type className="w-5 h-5 mr-2 text-indigo-600" />
                Masukkan {currentType?.name}
              </h3>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={currentType?.placeholder}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none transition-all duration-200 text-gray-700"
                  rows={5}
                />
                {text && (
                  <button
                    onClick={() => setText('')}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Character Count */}
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="text-gray-500">
                  {text.length} karakter
                </span>
                <span className={`font-medium ${
                  text.length > 2000 ? 'text-red-500' : text.length > 1000 ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {text.length > 2000 ? 'Terlalu panjang' : text.length > 1000 ? 'Panjang' : 'Optimal'}
                </span>
              </div>
              
              {/* Generate Button */}
              <div className="mt-6">
                <button
                  onClick={handleGenerateClick}
                  disabled={!text.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="font-semibold">Membuat QR Code...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">Generate QR Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200/50">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-left group"
              >
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-indigo-600" />
                  Pengaturan Lanjutan
                </h3>
                <RefreshCw className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>
              
              {showAdvanced && (
                <div className="mt-6 space-y-6">
                  {/* Color Presets */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Preset Warna
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => setOptions({...options, color: { dark: preset.dark, light: preset.light }})}
                          className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex">
                            <div 
                              className="w-4 h-4 rounded-l border"
                              style={{ backgroundColor: preset.dark }}
                            />
                            <div 
                              className="w-4 h-4 rounded-r border"
                              style={{ backgroundColor: preset.light }}
                            />
                          </div>
                          <span className="text-xs font-medium">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error Correction */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Level Koreksi Error
                    </label>
                    <select
                      value={options.errorCorrectionLevel}
                      onChange={(e) => setOptions({...options, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H'})}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="L">Rendah (7%) - File kecil</option>
                      <option value="M">Sedang (15%) - Seimbang</option>
                      <option value="Q">Tinggi (25%) - Lebih tahan rusak</option>
                      <option value="H">Sangat Tinggi (30%) - Terbaik untuk semua device</option>
                    </select>
                  </div>
                  
                  {/* Size */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ukuran: {options.width}px
                    </label>
                    <input
                      type="range"
                      min="256"
                      max="1024"
                      step="64"
                      value={options.width}
                      onChange={(e) => setOptions({...options, width: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>256px</span>
                      <span>1024px</span>
                    </div>
                  </div>
                  
                  {/* Margin */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Margin: {options.margin}px
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={options.margin}
                      onChange={(e) => setOptions({...options, margin: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  
                  {/* Custom Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Warna Depan
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={options.color.dark}
                          onChange={(e) => setOptions({...options, color: {...options.color, dark: e.target.value}})}
                          className="w-12 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={options.color.dark}
                          onChange={(e) => setOptions({...options, color: {...options.color, dark: e.target.value}})}
                          className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Warna Belakang
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={options.color.light}
                          onChange={(e) => setOptions({...options, color: {...options.color, light: e.target.value}})}
                          className="w-12 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={options.color.light}
                          onChange={(e) => setOptions({...options, color: {...options.color, light: e.target.value}})}
                          className="flex-1 p-2 border border-gray-200 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-indigo-600" />
                  Preview QR Code
                </h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {showPreview && (
                <div className="flex justify-center items-center min-h-[400px]">
                  {isGenerating ? (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                      </div>
                      <p className="text-gray-600 font-medium">Membuat QR code...</p>
                    </div>
                  ) : qrCodeUrl ? (
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img
                          src={qrCodeUrl}
                          alt="Generated QR Code"
                          className="mx-auto rounded-2xl shadow-2xl max-w-full h-auto border-4 border-white"
                          style={{ maxWidth: '300px' }}
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                      
                      {/* Success Message */}
                      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <div className="flex items-center justify-center space-x-2 text-green-700 font-semibold mb-2">
                          <Shield className="w-5 h-5" />
                          <span>QR Code Siap Digunakan!</span>
                        </div>
                        <div className="text-sm text-green-600 space-y-1">
                          <div className="flex items-center justify-center space-x-2">
                            <Smartphone className="w-4 h-4" />
                            <span>Kompatibel dengan semua device</span>
                          </div>
                          <div className="flex items-center justify-center space-x-2">
                            <Zap className="w-4 h-4" />
                            <span>Optimized untuk scanning cepat</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-2xl mb-4">
                        <QrCode className="w-12 h-12 text-gray-300" />
                      </div>
                      <p className="text-lg font-medium">Masukkan konten untuk membuat QR code</p>
                      <p className="text-sm mt-2">QR code akan muncul di sini secara otomatis</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {qrCodeUrl && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200/50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-indigo-600" />
                  Aksi QR Code
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => downloadQRCode()}
                    className="flex items-center justify-center space-x-3 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">Unduh PNG (High Quality)</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center space-x-2 w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="font-medium">Salin</span>
                    </button>
                    
                    {navigator.share && (
                      <button
                        onClick={shareQRCode}
                        className="flex items-center justify-center space-x-2 w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="font-medium">Bagikan</span>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Tips */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700 font-semibold mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Tips Scanning Optimal:
                  </p>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Pastikan pencahayaan cukup terang</li>
                    <li>• Jaga jarak 10-30cm dari kamera</li>
                    <li>• Hindari refleksi atau bayangan</li>
                    <li>• QR code ini telah dioptimalkan untuk semua scanner</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <History className="w-6 h-6 mr-3 text-indigo-600" />
              Riwayat QR Code ({history.length})
            </h3>
            <div className="flex space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={importHistory}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button
                onClick={exportHistory}
                disabled={history.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={clearHistory}
                disabled={history.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Semua</span>
              </button>
            </div>
          </div>
          
          {history.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada riwayat QR Code</p>
              <p className="text-gray-400 text-sm">QR Code yang Anda buat akan muncul di sini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item) => {
                const typeInfo = qrTypes.find(t => t.id === item.type);
                const Icon = typeInfo?.icon || Type;
                return (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded ${typeInfo?.color || 'bg-gray-500'} flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{typeInfo?.name}</span>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`p-1 rounded ${item.favorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                        >
                          <Star className={`w-4 h-4 ${item.favorite ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => deleteFromHistory(item.id)}
                          className="p-1 rounded text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <img
                        src={item.dataUrl}
                        alt="QR Code"
                        className="w-full h-32 object-contain bg-gray-50 rounded-lg"
                      />
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 truncate">{item.content}</p>
                    <p className="text-xs text-gray-400 mb-3">
                      {new Date(item.timestamp).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    
                    <button
                      onClick={() => loadFromHistory(item)}
                      className="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Gunakan Kembali
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <Star className="w-6 h-6 mr-3 text-indigo-600" />
              Template QR Code
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => {
              const typeInfo = qrTypes.find(t => t.id === template.type);
              const Icon = typeInfo?.icon || Type;
              return (
                <div key={template.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${typeInfo?.color || 'bg-gray-500'} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                      {template.template.substring(0, 100)}
                      {template.template.length > 100 && '...'}
                    </pre>
                  </div>
                  
                  <button
                    onClick={() => useTemplate(template)}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Gunakan Template
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGenerator;