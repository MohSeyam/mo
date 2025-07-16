import React from 'react';

export default function Spinner({ fullscreen = false }) {
  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20' : 'flex items-center justify-center'}>
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}