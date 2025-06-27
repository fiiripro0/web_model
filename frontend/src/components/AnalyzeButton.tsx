import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { apiService } from '../services/api';
import { Zap, AlertCircle } from 'lucide-react';

export function AnalyzeButton() {
  const { state, dispatch } = useAudio();

  const handleAnalyze = async () => {
    if (!state.currentRecording) {
      alert('Please select or record audio first');
      return;
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    dispatch({ type: 'CLEAR_RESULTS' });

    try {
      const result = await apiService.detectToxicity(
        state.currentRecording.blob,
        state.selectedModel
      );

      dispatch({ type: 'SET_RESULTS', payload: result });

      // Update the recording with results
      const updatedRecording = {
        ...state.currentRecording,
        results: result,
      };
      
      dispatch({ type: 'DELETE_RECORDING', payload: state.currentRecording.id });
      dispatch({ type: 'ADD_RECORDING', payload: updatedRecording });
    } catch (error) {
      dispatch({ type: 'SET_PROCESSING', payload: false });
      alert(error instanceof Error ? error.message : 'Analysis failed');
    }
  };

  const canAnalyze = state.currentRecording && !state.isProcessing;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="text-center">
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={`relative overflow-hidden px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
            canAnalyze
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            {state.isProcessing ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : canAnalyze ? (
              <Zap size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            
            <span>
              {state.isProcessing
                ? 'Analyzing Audio...'
                : canAnalyze
                ? 'Analyze for Toxicity'
                : 'Select Audio First'
              }
            </span>
          </div>

          {canAnalyze && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 hover:opacity-20 transition-opacity duration-300" />
          )}
        </button>

        {!state.currentRecording && (
          <p className="mt-4 text-sm text-gray-600">
            Record new audio or select from gallery to begin analysis
          </p>
        )}

        {state.currentRecording && !state.isProcessing && (
          <p className="mt-4 text-sm text-gray-600">
            Using <span className="font-semibold text-gray-800">
              {state.selectedModel === 'asr-text' ? 'ASR + Text Classification' : 'End-to-End Audio'}
            </span> model
          </p>
        )}
      </div>
    </div>
  );
}