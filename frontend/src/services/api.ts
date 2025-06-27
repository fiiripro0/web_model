import { DetectionResult } from "../contexts/AudioContext";

class ApiService {
  private baseUrl = "http://localhost:5000"; // Backend URL

  async detectToxicity(
    audioBlob: Blob,
    model: "asr-text" | "end-to-end"
  ): Promise<DetectionResult> {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");
    formData.append(
      "model_type",
      model === "asr-text" ? "asr_classification" : "audio_to_audio"
    );

    try {
      const response = await fetch(`${this.baseUrl}/api/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Detection failed");
      }

      const data = await response.json();

      // ✅ Correct mapping based on actual backend structure
      return {
        isToxic: data.result.toxicity.label === "toxic",
        confidence: data.result.toxicity.confidence,
        model,
        transcription: data.result.transcription,
        categories: data.result.toxicity.categories || [], // optional
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("API error:", error);
      throw new Error(
        error.message || "Failed to process audio. Please try again."
      );
    }
  }

  async submitFeedback(
    recordingId: string,
    feedback: {
      correct: boolean;
      actualToxicity?: boolean;
      comments?: string;
    }
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordingId, feedback }),
      });

      if (!response.ok) {
        throw new Error("Feedback submission failed");
      }
    } catch (error) {
      console.error("Feedback submission error:", error);
      throw new Error("Failed to submit feedback");
    }
  }
}

export const apiService = new ApiService();
