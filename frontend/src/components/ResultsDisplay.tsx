import React from "react";
import { useAudio } from "../contexts/AudioContext";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  Volume2,
} from "lucide-react";

export function ResultsDisplay() {
  const { state } = useAudio();

  if (!state.results && !state.isProcessing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Detection Results
        </h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Volume2 size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500">
            No results yet. Record or upload audio to begin analysis.
          </p>
        </div>
      </div>
    );
  }

  if (state.isProcessing) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Detection Results
        </h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Clock size={32} className="text-blue-500" />
          </div>
          <p className="text-gray-600 mb-2">Analyzing audio...</p>
          <div className="w-48 mx-auto bg-gray-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  const results = state.results!;
  console.log("Results object:", results);

  const normalizedConfidence =
    results.confidence > 1 ? results.confidence : results.confidence * 100;

  const confidenceColor =
    normalizedConfidence > 80
      ? "text-green-600"
      : normalizedConfidence > 60
      ? "text-yellow-600"
      : "text-red-600";

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Detection Results
      </h2>

      <div className="space-y-6">
        {/* Main Result */}
        <div
          className={`p-6 rounded-lg border-2 ${
            results.isToxic
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }`}
        >
          <div className="flex items-center gap-4 mb-4">
            {results.isToxic ? (
              <AlertTriangle size={32} className="text-red-500" />
            ) : (
              <CheckCircle size={32} className="text-green-500" />
            )}
            <div>
              <h3
                className={`text-xl font-bold ${
                  results.isToxic ? "text-red-900" : "text-green-900"
                }`}
              >
                {results.isToxic
                  ? "Toxic Content Detected"
                  : "Content is Clean"}
              </h3>
              <p
                className={`text-sm ${
                  results.isToxic ? "text-red-700" : "text-green-700"
                }`}
              >
                Model:{" "}
                {results.model === "asr-text"
                  ? "ASR + Text Classification"
                  : "End-to-End Audio"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700">
              Confidence:
            </span>
            <span className={`font-bold ${confidenceColor}`}>
              {`${normalizedConfidence.toFixed(2)}%`}
            </span>

            <div className="flex-1 bg-gray-200 rounded-full h-2 ml-3">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  normalizedConfidence > 80
                    ? "bg-green-500"
                    : normalizedConfidence > 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${normalizedConfidence}%` }}
              />
            </div>
          </div>

          {results.categories && results.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {results.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                >
                  {category
                    .replace("-", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Transcription */}
        {results.transcription && (
          <div className="bg-gray-50 rounded-lg p-6 border">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare size={20} className="text-gray-600" />
              <h4 className="font-semibold text-gray-900">Transcription</h4>
            </div>
            <p className="text-gray-800 leading-relaxed italic">
              "{results.transcription}"
            </p>
          </div>
        )}

        {/* Analysis Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2">
              Model Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Type:</span>
                <span className="font-medium text-blue-900">
                  {results.model === "asr-text" ? "Two-Stage" : "End-to-End"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Processing:</span>
                <span className="font-medium text-blue-900">
                  {results.model === "asr-text" ? "ASR → Text" : "Direct Audio"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <h4 className="font-semibold text-purple-900 mb-2">
              Analysis Time
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Processed:</span>
                <span className="font-medium text-purple-900">
                  {results.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Date:</span>
                <span className="font-medium text-purple-900">
                  {results.timestamp.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
