import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Zap, MessageCircle } from 'lucide-react';

export function ModelSelector() {
  const { state, dispatch } = useAudio();

  const models = [
    {
      id: 'asr-text' as const,
      name: 'ASR + Text Classification',
      description: 'Speech-to-text then toxicity analysis',
      icon: MessageCircle,
      features: ['Transcription available', 'Text-based analysis', 'High accuracy'],
    },
    {
      id: 'end-to-end' as const,
      name: 'End-to-End Audio',
      description: 'Direct audio toxicity detection',
      icon: Zap,
      features: ['Faster processing', 'Audio-based analysis', 'Real-time capable'],
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Select Detection Model</h2>
      
      <div className="grid md:grid-cols-2 gap-4">
        {models.map((model) => {
          const Icon = model.icon;
          const isSelected = state.selectedModel === model.id;
          
          return (
            <button
              key={model.id}
              onClick={() => dispatch({ type: 'SET_MODEL', payload: model.id })}
              className={`relative p-6 rounded-lg border-2 transition-all duration-300 text-left group ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg transition-colors ${
                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}>
                  <Icon size={24} />
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 transition-colors ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {model.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {model.description}
                  </p>
                  
                  <div className="space-y-1">
                    {model.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          isSelected ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}