import React from 'react';
import { Header } from '../components/Header';
import { ModelSelector } from '../components/ModelSelector';
import { AudioInput } from '../components/AudioInput';
import { AnalyzeButton } from '../components/AnalyzeButton';
import { ResultsDisplay } from '../components/ResultsDisplay';
import { FeedbackSystem } from '../components/FeedbackSystem';
import { AudioGallery } from '../components/AudioGallery';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            <ModelSelector />
            <AudioInput />
            <AnalyzeButton />
            <ResultsDisplay />
          </div>
          
          {/* Right Column - Gallery & Feedback */}
          <div className="space-y-6">
            <AudioGallery />
            <FeedbackSystem />
          </div>
        </div>
      </main>
    </div>
  );
}