import React from 'react';
import QRGenerator from './components/QRGenerator';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <QRGenerator />
      </main>
      <Footer />
    </div>
  );
}

export default App;