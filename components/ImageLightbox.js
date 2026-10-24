'use client';

import { useState } from 'react';

export default function ImageLightbox({ images = [] }) {
  const [activeImage, setActiveImage] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[#1c2638]">
      <div className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-2">
        Attached Photos ({images.length}/4)
      </div>
      <div className="flex flex-wrap gap-3">
        {images.map((img, idx) => (
          <div key={idx} className="relative group">
            <button
              type="button"
              onClick={() => setActiveImage(img.url)}
              className="relative block rounded overflow-hidden border border-[#4a3a1b] hover:border-[#f8b700] hover:shadow-[0_0_12px_rgba(248,183,0,0.4)] transition-all bg-[#0a0f18] focus:outline-none"
              title="Click to view full image"
            >
              <img
                src={img.url}
                alt={img.fileName || `Attachment ${idx + 1}`}
                className="w-28 h-28 sm:w-36 sm:h-36 object-cover object-center group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-semibold text-[#f8b700]">
                Expand
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#0c121e] border border-[#f8b700] rounded-md p-2 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-[#2b2112]">
              <span className="text-xs font-mono text-[#f8b700]">Attached Photo</span>
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 py-0.5 rounded bg-slate-800/80"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                src={activeImage}
                alt="Full size attachment"
                className="max-w-full max-h-[75vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
