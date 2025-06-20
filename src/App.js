import React, { useState } from 'react';
import axios from 'axios';
import './styles.css';

function App() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert('Please select a PDF file');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/analyze', formData);
      setFeedback(formatFeedback(res.data.feedback));
    } catch (err) {
      alert('Error uploading resume.');
    } finally {
      setLoading(false);
    }
  };

  const formatFeedback = (text) => {
    const lines = text.split(/\n+/);
    const sections = { strengths: [], weaknesses: [], suggestions: [] };
    let currentSection = '';

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (/^\*\*Strengths/.test(trimmed)) currentSection = 'strengths';
      else if (/^\*\*Weaknesses/.test(trimmed)) currentSection = 'weaknesses';
      else if (/^\*\*Suggestions/.test(trimmed)) currentSection = 'suggestions';
      else if (currentSection && trimmed) {
        // Remove leading numbering (e.g., "1. ", "2. ")
        const cleanedLine = trimmed.replace(/^\d+\.\s*/, '');
        sections[currentSection].push(cleanedLine);
      }
    });

    return sections;
  };

  const parseMarkdownBold = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="container">
      <h1 className="title">🧠 Smart Resume Analyzer</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} className="file-input" />
      <button onClick={handleUpload} className="analyze-btn">
        {loading ? 'Analyzing...' : 'Upload and Analyze'}
      </button>

      {feedback && (
        <div className="feedback">
          {['strengths', 'weaknesses', 'suggestions'].map((section) =>
            feedback[section] && (
              <div key={section} className="section">
                <h2 className="section-title">
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </h2>
                <ul className="bullet-list">
                  {feedback[section].map((point, i) => (
                    <li
                      key={i}
                      className="bullet"
                      dangerouslySetInnerHTML={{ __html: parseMarkdownBold(point) }}
                    />
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default App;
