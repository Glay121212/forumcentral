'use client';

import { useState } from 'react';

export default function ImageUploader({ isGuest = false }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const maxFiles = 4;
  const maxBytes = isGuest ? 1 * 1024 * 1024 : 3 * 1024 * 1024;
  const limitLabel = isGuest ? '1 MB' : '3 MB';

  const handleFileChange = (e) => {
    setErrorMsg('');
    const files = Array.from(e.target.files || []);

    if (files.length + selectedFiles.length > maxFiles) {
      setErrorMsg(`You can attach up to ${maxFiles} photos in total.`);
      return;
    }

    const newFiles = [];
    for (const file of files) {
      if (file.size > maxBytes) {
        setErrorMsg(`"${file.name}" exceeds the ${limitLabel} file limit for ${isGuest ? 'guests' : 'members'}.`);
        return;
      }
      // Check extension as preliminary hint
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        setErrorMsg(`"${file.name}" is not an accepted format. Only JPG, PNG, WebP, and GIF images are allowed.`);
        return;
      }
      newFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB',
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Attach Photos (Max 4, {limitLabel} each)
        </label>
        <span className="text-[11px] text-slate-400 font-mono">
          Formats: JPG, PNG, WebP, GIF (magic bytes verified)
        </span>
      </div>

      {errorMsg && (
        <div className="p-2.5 rounded bg-red-950/80 border border-red-700/60 text-red-200 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Selected Previews */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {selectedFiles.map((item, idx) => (
            <div
              key={idx}
              className="relative group rounded border border-[#4a3a1b] bg-[#0c121e] p-1.5 flex flex-col items-center"
            >
              <img
                src={item.previewUrl}
                alt={item.name}
                className="w-full h-24 object-cover rounded mb-1.5"
              />
              <span className="text-[11px] font-mono text-slate-300 truncate w-full text-center">
                {item.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{item.size}</span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold shadow hover:bg-red-600"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length < maxFiles && (
        <div>
          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs btn-wow-dark">
            <span>+ Choose Photo ({selectedFiles.length}/{maxFiles})</span>
            <input
              type="file"
              name="images"
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
