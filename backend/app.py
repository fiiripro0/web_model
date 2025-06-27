from flask import Flask, request, jsonify
from flask_cors import CORS
from models.toxicity_classifier import analyze_audio
import tempfile
import os

app = Flask(__name__)

# ✅ Allow frontend from Vite dev server
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

@app.route('/api/process', methods=['POST'])
def process_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    model_type = request.form.get('model_type', 'asr_classification')

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
        audio_file.save(tmp.name)
        result = analyze_audio(tmp.name, model_type)
    
    os.unlink(tmp.name)
    return jsonify({"status": "success", "result": result})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
