
import React, { useState, MouseEvent } from 'react';
import { InjectionPoint } from '../types';

interface FaceMapProps {
  points: InjectionPoint[];
  onAddPoint?: (point: { x: number; y: number }) => void;
  readOnly?: boolean;
  className?: string;
}

export const FaceMap: React.FC<FaceMapProps> = ({ points, onAddPoint, readOnly = false, className = '' }) => {
  const handleClick = (e: MouseEvent<SVGSVGElement>) => {
    if (readOnly || !onAddPoint) return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    onAddPoint({ x, y });
  };

  return (
    <div className={`relative aspect-[3/4] bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <svg 
        viewBox="0 0 100 120" 
        className={`w-full h-full ${!readOnly ? 'cursor-crosshair' : ''}`}
        onClick={handleClick}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Simplified Face Outline */}
        <defs>
           <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" style={{stopColor:'#fdfbf7', stopOpacity:1}} />
             <stop offset="100%" style={{stopColor:'#f5f0e6', stopOpacity:1}} />
           </linearGradient>
           <filter id="shadow">
              <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="#000" floodOpacity="0.1"/>
           </filter>
        </defs>
        
        {/* Head Shape */}
        <path 
          d="M20,30 C20,10 80,10 80,30 C80,60 70,90 50,100 C30,90 20,60 20,30 Z" 
          fill="url(#skinGradient)" 
          stroke="#d1d5db" 
          strokeWidth="0.5"
        />
        
        {/* Guidelines (Subtle) */}
        <line x1="50" y1="20" x2="50" y2="95" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1,1" />
        <line x1="25" y1="45" x2="75" y2="45" stroke="#e5e7eb" strokeWidth="0.2" strokeDasharray="1,1" />
        
        {/* Eyes */}
        <ellipse cx="35" cy="45" rx="5" ry="2.5" fill="#e2e8f0" opacity="0.5" />
        <ellipse cx="65" cy="45" rx="5" ry="2.5" fill="#e2e8f0" opacity="0.5" />
        
        {/* Nose */}
        <path d="M50,45 L48,65 L52,65 Z" fill="#e2e8f0" opacity="0.3" />
        
        {/* Mouth */}
        <path d="M40,75 Q50,80 60,75" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

        {/* Injection Points */}
        {points.map((p, idx) => (
          <g key={p.id || idx}>
             <circle 
                cx={p.x} 
                cy={p.y} 
                r={readOnly ? "2" : "2.5"} 
                fill="#ef4444" 
                stroke="white" 
                strokeWidth="0.5"
                filter="url(#shadow)"
                className="transition-all duration-300 ease-out transform hover:scale-150"
             />
             {/* Tooltip-ish text for units if space permits */}
             {p.units && (
                <text x={p.x + 3} y={p.y} fontSize="3" fill="#374151" className="font-sans font-bold">
                  {p.units}u
                </text>
             )}
          </g>
        ))}
      </svg>
      
      {!readOnly && (
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
          <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
            לחץ על האזור לסימון הזרקה
          </span>
        </div>
      )}
    </div>
  );
};
