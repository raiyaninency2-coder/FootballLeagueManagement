import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-emerald-400 font-bold">⚽ Football League Management</span>
          <span>• Built with React, Vite, Node.js & MySQL</span>
        </div>
        <p className="text-xs">
          Automatic Standings Calculation & Realtime Match Events Engine
        </p>
      </div>
    </footer>
  );
};

export default Footer;
