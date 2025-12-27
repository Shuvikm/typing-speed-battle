import React, { useEffect, useRef } from 'react';
import { animeAnimations } from '../utils/animeHelper';

const AnimeBackground = ({ children, videoSrc, mangaImages = [] }) => {
  const backgroundRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (backgroundRef.current) {
      // Animate background opacity
      animeAnimations.backgroundWave(backgroundRef.current);
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video Layer (if provided) */}
      {videoSrc && (
        <div 
          ref={backgroundRef}
          className="absolute inset-0 opacity-20 animate-opacity-fade-bg"
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: 0.3 }}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/80 via-dark-bg/60 to-dark-bg/80"></div>
        </div>
      )}

      {/* Manga Images Layer (if provided) */}
      {mangaImages.length > 0 && (
        <div className="absolute inset-0 opacity-10 animate-opacity-wave">
          {mangaImages.map((img, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${(index * 20) % 100}%`,
                top: `${(index * 15) % 100}%`,
                width: '200px',
                height: '200px',
                opacity: 0.1,
              }}
            >
              <img
                src={img}
                alt={`Manga panel ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
                style={{ mixBlendMode: 'overlay' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimeBackground;

