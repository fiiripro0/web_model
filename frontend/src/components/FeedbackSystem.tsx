import { useState } from "react";
import { useAudio } from "../contexts/AudioContext";
import { apiService } from "../services/api";
import { ThumbsUp, ThumbsDown, MessageCircle, Send } from "lucide-react";

export function FeedbackSystem() {
  const { state } = useAudio();
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [actualToxicity, setActualToxicity] = useState<boolean | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!state.results || !state.currentRecording) {
    return null;
  }

  const handleSubmit = async () => {
    if (isCorrect === null) return;

    setIsSubmitting(true);
    try {
      // API-based submission instead of email
      await apiService.submitFeedback(state.currentRecording!.id, {
        correct: isCorrect,
        actualToxicity: actualToxicity ?? undefined,
        comments: comments.trim() || undefined,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Feedback submission error:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsCorrect(null);
    setActualToxicity(null);
    setComments("");
    setSubmitted(false);
  };

  // Submitted state UI remains the same
  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ThumbsUp size={32} className="text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Thank You!
          </h3>
          <p className="text-gray-600 mb-4">
            Your feedback helps improve our detection models.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Provide More Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Help Improve Detection
      </h2>

      <div className="space-y-6">
        {/* Correctness Question - unchanged */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Was the detection result correct?
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => setIsCorrect(true)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                isCorrect === true
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <ThumbsUp size={20} />
              <span>Correct</span>
            </button>
            <button
              onClick={() => setIsCorrect(false)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                isCorrect === false
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <ThumbsDown size={20} />
              <span>Incorrect</span>
            </button>
          </div>
        </div>

        {/* Actual classification - unchanged */}
        {isCorrect === false && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              What should the correct classification be?
            </h3>
            <div className="flex gap-3">
              <button
                onClick={() => setActualToxicity(true)}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  actualToxicity === true
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                Toxic
              </button>
              <button
                onClick={() => setActualToxicity(false)}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  actualToxicity === false
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                Not Toxic
              </button>
            </div>
          </div>
        )}

        {/* Comments - unchanged */}
        <div>
          <label
            htmlFor="comments"
            className="block font-semibold text-gray-900 mb-3"
          >
            Additional Comments (Optional)
          </label>
          <div className="relative">
            <MessageCircle
              size={20}
              className="absolute left-3 top-3 text-gray-400"
            />
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any additional context or comments about this detection..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button - unchanged */}
        <button
          onClick={handleSubmit}
          disabled={isCorrect === null || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
            isCorrect === null || isSubmitting
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl"
          }`}
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <Send size={20} />
          )}
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
