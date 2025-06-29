import React, { useState, useRef, useEffect } from "react";
import { useAudio } from "../contexts/AudioContext";
import { audioService } from "../services/audioService";
import { apiService } from "../services/api";
import {
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  Video,
  FileAudio,
  Loader,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

export function AudioInput() {
  const { state, dispatch } = useAudio();
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [processingProgress, setProcessingProgress] = useState("");
  const [processingError, setProcessingError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showBrowserInfo, setShowBrowserInfo] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null); // <-- Added to store video file for playback

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null); // <-- Added video ref
  const intervalRef = useRef<NodeJS.Timeout>();
  const playbackProgressRef = useRef<HTMLDivElement>(null);

  const startRecording = async () => {
    try {
      await audioService.startRecording();
      dispatch({ type: "START_RECORDING" });
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      setProcessingError(
        error instanceof Error ? error.message : "Recording failed"
      );
      setTimeout(() => setProcessingError(""), 5000);
    }
  };

  const stopRecording = async () => {
    try {
      const blob = await audioService.stopRecording();
      const duration = await audioService.getAudioDuration(blob);

      const recording = {
        id: Date.now().toString(),
        name: `Recording ${new Date().toLocaleTimeString()}`,
        blob,
        url: URL.createObjectURL(blob),
        duration,
        timestamp: new Date(),
      };

      dispatch({ type: "STOP_RECORDING" });
      dispatch({ type: "ADD_RECORDING", payload: recording });

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      setProcessingProgress("Recording saved successfully!");
      setTimeout(() => setProcessingProgress(""), 3000);
    } catch (error) {
      setProcessingError(
        error instanceof Error ? error.message : "Failed to stop recording"
      );
      setTimeout(() => setProcessingError(""), 5000);
    }
  };

  const analyzeAudio = async (blob: Blob) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      setIsAnalyzing(true);
      setProcessingProgress("Analyzing audio for toxicity...");

      const wavBlob = await audioService.convertToWav(blob);
      const result = await apiService.detectToxicity(
        wavBlob,
        state.selectedModel || "asr-text"
      );

      dispatch({ type: "SET_RESULTS", payload: result });
      setProcessingProgress("Analysis completed successfully!");
    } catch (error) {
      console.error("Analysis error:", error);
      setProcessingError(
        error instanceof Error ? error.message : "Analysis failed"
      );
      setTimeout(() => setProcessingError(""), 5000);
    } finally {
      setTimeout(() => setProcessingProgress(""), 3000);
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setProcessingError("");
    setProcessingProgress("");
    setVideoFile(null); // Reset video file on new upload

    try {
      let audioBlob: Blob;
      let duration: number;
      let fileName = file.name;

      if (audioService.isVideoFile(file)) {
        setProcessingProgress(
          "Extracting audio from video... This may take a moment."
        );

        try {
          const result = await audioService.convertVideoToAudio(file);
          audioBlob = result.audioBlob;
          duration = result.duration;
          fileName = file.name.replace(/\.[^/.]+$/, "") + " (extracted audio)";

          setProcessingProgress("Audio extracted successfully!");
          setVideoFile(file); // <-- Save video file for playback
        } catch (videoError) {
          console.error("Video conversion error:", videoError);
          throw new Error(
            `Failed to extract audio from video: ${
              videoError instanceof Error ? videoError.message : "Unknown error"
            }`
          );
        }
      } else if (audioService.isAudioFile(file)) {
        setProcessingProgress("Processing audio file...");
        audioBlob = file;
        duration = await audioService.getAudioDuration(file);
        if (duration === 0) {
          throw new Error(
            "Could not determine audio duration. File may be corrupted."
          );
        }
      } else {
        throw new Error(
          "Unsupported file type. Please upload an audio file (MP3, WAV, M4A, etc.) or video file (MP4, AVI, MOV, etc.)"
        );
      }

      if (audioBlob.size === 0) {
        throw new Error("The processed audio file is empty");
      }

      // Validate the audio blob
      const isValid = await audioService.validateAudioBlob(audioBlob);
      if (!isValid) {
        throw new Error(
          "The processed audio file appears to be corrupted or unplayable"
        );
      }

      const recording = {
        id: Date.now().toString(),
        name: fileName,
        blob: audioBlob,
        url: URL.createObjectURL(audioBlob),
        duration,
        timestamp: new Date(),
      };

      dispatch({ type: "ADD_RECORDING", payload: recording });
      setProcessingProgress("File processed successfully!");

      setTimeout(() => setProcessingProgress(""), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process file";
      setProcessingError(errorMessage);
      console.error("File processing error:", error);
      setTimeout(() => setProcessingError(""), 8000);
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !state.currentRecording) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playbackProgressRef.current) return;

    const updateProgress = () => {
      if (!playbackProgressRef.current || !audio.duration) return;
      const progress = (audio.currentTime / audio.duration) * 100;
      playbackProgressRef.current.style.width = `${Math.min(
        100,
        Math.max(0, progress)
      )}%`;
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [state.currentRecording, isPlaying]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getBrowserCapabilities = () => {
    return audioService.getBrowserCapabilities();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Audio Input</h2>
        <button
          onClick={() => setShowBrowserInfo(!showBrowserInfo)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Browser compatibility info"
        >
          <Info size={20} />
        </button>
      </div>

      {showBrowserInfo && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            Browser Capabilities
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            {(() => {
              const caps = getBrowserCapabilities();
              return (
                <>
                  <p>
                    ✓ MediaRecorder:{" "}
                    {caps.supportsMediaRecorder ? "Supported" : "Not supported"}
                  </p>
                  <p>
                    ✓ Web Audio API:{" "}
                    {caps.supportsWebAudio ? "Supported" : "Not supported"}
                  </p>
                  <p>
                    ✓ Supported formats:{" "}
                    {caps.supportedFormats.length > 0
                      ? caps.supportedFormats.join(", ")
                      : "None"}
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-4">
            {!state.isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessingFile || isAnalyzing}
                className="group rounded-full p-4 shadow-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Start recording"
              >
                <Mic size={24} />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="group bg-gray-800 hover:bg-gray-900 text-white rounded-full p-4 shadow-lg transition-all"
                title="Stop recording"
              >
                <Square size={24} />
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingFile || isAnalyzing || state.isRecording}
              className="group rounded-full p-4 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload audio or video file"
            >
              {isProcessingFile || isAnalyzing ? (
                <Loader size={24} className="animate-spin" />
              ) : (
                <Upload size={24} />
              )}
            </button>
          </div>

          {state.isRecording && (
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-mono text-lg font-semibold">
                {formatTime(recordingTime)}
              </span>
            </div>
          )}

          {(isProcessingFile || isAnalyzing) && processingProgress && (
            <div className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg flex items-center gap-3 max-w-md text-center">
              <Loader size={16} className="animate-spin flex-shrink-0" />
              <span className="text-sm">{processingProgress}</span>
            </div>
          )}

          {!isProcessingFile && !isAnalyzing && processingProgress && (
            <div className="text-green-600 bg-green-50 px-4 py-2 rounded-lg flex items-center gap-3">
              <CheckCircle size={16} />
              <span className="text-sm">{processingProgress}</span>
            </div>
          )}

          {processingError && (
            <div className="text-red-600 bg-red-50 px-4 py-2 rounded-lg flex items-start gap-3 max-w-md">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Processing Error:</p>
                <p>{processingError}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Mic size={16} />
            <span>Record</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <FileAudio size={16} />
            <span>Upload Audio</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Video size={16} />
            <span>Extract from Video</span>
          </div>
        </div>

        {/* Video Playback Section */}
        {videoFile && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Video Playback</h3>
            <video
              ref={videoRef}
              src={URL.createObjectURL(videoFile)}
              controls
              className="w-full rounded-md bg-black"
              preload="metadata"
            />
          </div>
        )}

        {/* Current Recording Playback */}
        {state.currentRecording && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
            <h3 className="font-semibold text-gray-900 mb-4">
              Current Recording
            </h3>

            <div className="flex items-center gap-4">
              <button
                onClick={togglePlayback}
                className={`rounded-full p-3 shadow-md text-white transition-all ${
                  isPlaying
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 truncate">
                    {state.currentRecording.name}
                  </span>
                  <span className="text-sm text-gray-600 flex-shrink-0 ml-2">
                    {audioService.formatDuration(
                      state.currentRecording.duration
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    ref={playbackProgressRef}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
              <span>
                Size:{" "}
                {audioService.formatFileSize(state.currentRecording.blob.size)}
              </span>
              <span>Type: {state.currentRecording.blob.type || "Unknown"}</span>
            </div>

            <audio
              ref={audioRef}
              src={state.currentRecording.url}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              preload="metadata"
            />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isProcessingFile || isAnalyzing || state.isRecording}
      />
    </div>
  );
}
