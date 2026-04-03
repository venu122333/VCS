
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-12 h-12", showText = true, light = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          {/* Globe Background */}
          <circle cx="50" cy="50" r="45" fill="#0d47a1" />
          <circle cx="50" cy="50" r="42" fill="#1e88e5" />
          
          {/* Continents */}
          <path 
            d="M30 40c5-5 15-5 20 0s15 5 20 0M25 60c10 5 25 5 35 0M45 25c5 5 5 15 0 20" 
            stroke="#4caf50" 
            strokeWidth="8" 
            strokeLinecap="round" 
            fill="none" 
            opacity="0.8"
          />
          
          {/* Flight Paths */}
          <circle 
            cx="50" 
            cy="50" 
            r="35" 
            fill="none" 
            stroke="white" 
            strokeWidth="1" 
            strokeDasharray="3 3" 
            opacity="0.6"
          />
          
          {/* Planes */}
          <g transform="rotate(-30 50 50)">
            <path d="M85 50l-4-2v4l4-2z" fill="white" />
            <path d="M81 50h-2" stroke="white" strokeWidth="1" />
          </g>
          <g transform="rotate(150 50 50)">
            <path d="M85 50l-4-2v4l4-2z" fill="white" />
            <path d="M81 50h-2" stroke="white" strokeWidth="1" />
          </g>
          
          {/* Text Overlay (Simplified) */}
          <text 
            x="50" 
            y="55" 
            textAnchor="middle" 
            fill="white" 
            fontSize="14" 
            fontWeight="bold" 
            style={{ fontFamily: 'cursive' }}
          >
            Explore
          </text>
          <text 
            x="50" 
            y="70" 
            textAnchor="middle" 
            fill="white" 
            fontSize="8" 
            fontWeight="900"
            style={{ letterSpacing: '1px' }}
          >
            THE WORLD
          </text>
        </svg>
      </div>
      {showText && (
        <span className={`text-2xl font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
          Nomad<span className="text-blue-600">AI</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
