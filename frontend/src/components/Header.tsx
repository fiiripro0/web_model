import React from 'react';
import { Shield, Volume2 } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-3 border border-white/20">
                <Shield size={32} />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Somali Toxicity Detector</h1>
              <p className="text-blue-100 mt-1">AI-powered audio content moderation</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Volume2 size={16} />
              <span>Real-time Analysis</span>
            </div>
            <div className="text-right">
              <div className="text-white/90">Powered by</div>
              <div className="font-semibold">Advanced AI Models</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}