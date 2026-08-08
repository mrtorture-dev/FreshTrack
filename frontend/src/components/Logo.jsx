import React from 'react';

export default function Logo({ size = 40, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="blockGrad" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Blockchain Hexagon Shield */}
      <path 
        d="M50 5 L85 25 L85 70 L50 90 L15 70 L15 25 Z" 
        stroke="url(#blockGrad)" 
        strokeWidth="6" 
        strokeLinejoin="round" 
        fill="rgba(59, 130, 246, 0.08)" 
        filter="url(#glow)"
      />
      
      {/* Organic Leaf (Freshness) */}
      <path 
        d="M50 85 C50 85 20 60 20 35 C20 15 50 15 50 15 C50 15 80 15 80 35 C80 60 50 85 50 85 Z" 
        fill="url(#leafGrad)" 
        opacity="0.95" 
      />
      
      {/* Node connections inside leaf (Traceability Network) */}
      <circle cx="50" cy="30" r="4" fill="#ffffff" opacity="0.9" />
      <circle cx="35" cy="50" r="3" fill="#ffffff" opacity="0.9" />
      <circle cx="65" cy="50" r="3" fill="#ffffff" opacity="0.9" />
      <circle cx="50" cy="65" r="3" fill="#ffffff" opacity="0.9" />
      
      <path d="M50 30 L35 50 L50 65 L65 50 Z" stroke="#ffffff" strokeWidth="2" strokeLinejoin="round" opacity="0.6" />
      <path d="M50 30 L50 65" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}
