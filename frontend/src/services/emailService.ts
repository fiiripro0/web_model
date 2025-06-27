import axios from "axios";

const EMAIL_API_BASE = "https://api.emailservice.com";
const API_KEY = import.meta.env.VITE_EMAIL_API_KEY;

interface EmailPayload {
  to: string[];
  subject: string;
  content: string;
  templateId?: string;
}

export interface FeedbackData {
  recordingId: string;
  modelUsed: string;
  confidence: number;
  correct: boolean;
  actualToxicity?: boolean;
  comments?: string;
}

// Helper function to format email content
function formatFeedbackContent(data: FeedbackData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #333; margin-top: 0;">User Feedback Submission</h2>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p><strong>Recording ID:</strong> ${data.recordingId}</p>
        <p><strong>Model Used:</strong> ${data.modelUsed}</p>
        <p><strong>Confidence Level:</strong> ${(data.confidence * 100).toFixed(
          2
        )}%</p>
      </div>
      
      <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1a56db; margin-top: 0;">Feedback Summary</h3>
        <p><strong>Detection was correct?</strong> ${
          data.correct ? "✅ Yes" : "❌ No"
        }</p>
        
        ${
          !data.correct
            ? `
          <p><strong>Correct classification:</strong> 
          ${
            data.actualToxicity
              ? '<span style="color: #e02424; font-weight: bold;">Toxic</span>'
              : '<span style="color: #0e9f6e; font-weight: bold;">Non-Toxic</span>'
          }</p>
        `
            : ""
        }
      </div>
      
      ${
        data.comments
          ? `
        <div style="background-color: #f8f5ff; padding: 15px; border-radius: 8px;">
          <h3 style="color: #6d28d9; margin-top: 0;">User Comments</h3>
          <p style="font-style: italic; white-space: pre-wrap;">${data.comments}</p>
        </div>
      `
          : ""
      }
      
      <p style="margin-top: 25px; color: #6b7280; font-size: 14px; border-top: 1px solid #eee; padding-top: 10px;">
        Sent from Toxicity Detection System
      </p>
    </div>
  `;
}

export const emailService = {
  /**
   * Send feedback email to the support team
   */
  async sendFeedbackEmail(feedback: FeedbackData): Promise<void> {
    // Validate API key presence
    if (!API_KEY) {
      const errorMsg = "Email API key is missing";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const payload: EmailPayload = {
      to: ["feedback@toxicity-detection.com"],
      subject: `Feedback - Recording ${feedback.recordingId.slice(0, 8)}`,
      content: formatFeedbackContent(feedback),
      templateId: "feedback-template",
    };

    try {
      const response = await axios.post(`${EMAIL_API_BASE}/send`, payload, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10-second timeout
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("Feedback email sent successfully");
      } else {
        throw new Error(`Email service returned ${response.status}`);
      }
    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      };

      console.error("Email send failed:", errorDetails);
      throw new Error("Failed to send feedback email. Please try again later.");
    }
  },

  /**
   * Get available email templates from service
   */
  async getTemplates(): Promise<any[]> {
    if (!API_KEY) {
      console.warn("API key missing - skipping template fetch");
      return [];
    }

    try {
      const response = await axios.get(`${EMAIL_API_BASE}/templates`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        timeout: 5000, // 5-second timeout
      });

      return response.data?.templates || [];
    } catch (error) {
      console.error("Template fetch error:", error);
      return [];
    }
  },
};
