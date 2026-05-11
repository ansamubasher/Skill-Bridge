import React, { useState, useRef, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';

/* ─────────────────────── Success Popup ─────────────────────── */
function SuccessPopup({ onClose, onGoToDashboard }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full mx-4 flex flex-col items-center text-center"
        style={{ animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Animated checkmark */}
        <div className="relative mb-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path
                d="M12 24L21 33L36 15"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: 'drawCheck 0.5s ease 0.3s both' }}
              />
            </svg>
          </div>
          <div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-xs"
          >
            🎉
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Work Delivered!</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Your work has been submitted successfully. The client will be notified and can review your submission shortly.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onGoToDashboard}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Submit Another Delivery
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity:0; transform:scale(0.7); }
          to   { opacity:1; transform:scale(1);   }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 60; }
          to   { stroke-dashoffset: 0;  }
        }
        svg path { stroke-dasharray: 60; stroke-dashoffset: 0; }
      `}</style>
    </div>
  );
}

/* ─────────────────── Drop-Zone File Card ────────────────────── */
function FileCard({ file, onRemove }) {
  const ext = file.name.split('.').pop().toUpperCase();
  const sizeLabel =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
      >
        {ext.slice(0, 4)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sizeLabel}</p>
      </div>
      <button
        onClick={onRemove}
        className="shrink-0 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        title="Remove file"
      >
        ✕
      </button>
    </div>
  );
}

/* ─────────────────────── Main Page ─────────────────────────── */
export default function DeliverWork() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useContext(AuthContext);

  // Determine correct dashboard based on role
  const dashboardPath = (() => {
    const role = Array.isArray(user?.role) ? user.role[0] : user?.role;
    return role === 'client' ? '/dashboard' : '/freelancer-dashboard';
  })();

  // Contract info passed via navigate state (optional)
  const contract = location.state?.contract || null;

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const inputRef = useRef();

  /* ── File helpers ── */
  const addFiles = useCallback((incoming) => {
    const fresh = Array.from(incoming).filter(
      (f) => !files.some((existing) => existing.name === f.name && existing.size === f.size)
    );
    setFiles((prev) => [...prev, ...fresh]);
  }, [files]);

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  /* ── Drag & Drop ── */
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('Please attach at least one file before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      // For this implementation, we send metadata as we don't have a full multer/S3 setup yet
      // but this will persist the delivery in the database for the client to see.
      const deliveryData = {
        projectId: contract?.project?._id,
        message: message,
        files: files.map(f => ({
          fileName: f.name,
          fileSize: f.size > 1024 * 1024 
            ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` 
            : `${(f.size / 1024).toFixed(0)} KB`,
          fileUrl: '#' // placeholder since we aren't uploading to a real CDN yet
        }))
      };

      if (!deliveryData.projectId) {
        setError('Project information missing. Please return to dashboard and try again.');
        return;
      }

      await axiosInstance.post('/projects/deliver', deliveryData);

      setShowSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setMessage('');
    setShowSuccess(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg,#fff7f0 0%,#f9fafb 60%,#fef3e2 100%)', fontFamily: "'Inter',sans-serif" }}
    >
      <Navbar />

      {showSuccess && (
        <SuccessPopup
          onClose={resetForm}
          onGoToDashboard={() => navigate(dashboardPath)}
        />
      )}

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        {/* ── Back button ── */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <span className="text-lg">←</span> Back
        </button>

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
            >
              📦
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800">Deliver Work</h1>
          </div>
          {contract && (
            <p className="text-sm text-gray-500 mt-1 ml-13">
              Project: <span className="font-semibold text-orange-600">{contract.project?.title || 'Your Project'}</span>
              {contract.client?.name && (
                <> &nbsp;·&nbsp; Client: <span className="font-semibold">{contract.client.name}</span></>
              )}
            </p>
          )}
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer transition-all duration-200 mx-6 mt-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-12 gap-3"
            style={{
              borderColor: dragOver ? '#f97316' : '#e5e7eb',
              background: dragOver ? '#fff7f0' : '#fafafa',
            }}
          >
            <div className="text-5xl">📁</div>
            <div className="text-center">
              <p className="font-semibold text-gray-700">Drop files here or <span className="text-orange-500 underline">browse</span></p>
              <p className="text-xs text-gray-400 mt-1">Any file type · Max 50 MB per file</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="px-6 mt-4 space-y-2">
              {files.map((f, i) => (
                <FileCard key={i} file={f} onRemove={() => removeFile(i)} />
              ))}
            </div>
          )}

          {/* Message */}
          <div className="px-6 mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message to Client <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Add any notes, instructions, or context about your submission..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:border-orange-400 transition-all"
              style={{ '--tw-ring-color': '#f9731640' }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <div className="px-6 py-6 mt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-4 rounded-2xl text-white font-bold text-base tracking-wide shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background: submitting
                  ? '#f97316'
                  : 'linear-gradient(135deg,#f97316 0%,#ea580c 100%)',
                boxShadow: '0 6px 20px rgba(249,115,22,0.35)',
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Submitting…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  📨 Submit Delivery
                </span>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              The client will be notified immediately after submission.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
