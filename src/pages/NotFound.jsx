import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#0a0a0f',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Audiowide, Orbitron, sans-serif',
                overflow: 'hidden',
                position: 'relative',
            }}
        >
            {/* Background orbs */}
            <div style={{
                position: 'absolute', top: '-120px', left: '-120px',
                width: '480px', height: '480px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(176,38,255,0.08), transparent 70%)',
                animation: 'float 7s ease-in-out infinite',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-120px', right: '-120px',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,217,255,0.08), transparent 70%)',
                animation: 'float 9s ease-in-out infinite reverse',
                pointerEvents: 'none',
            }} />

            {/* Content */}
            <div style={{ textAlign: 'center', zIndex: 1 }}>
                <div style={{ fontSize: '6rem', marginBottom: '8px', animation: 'float 2.5s ease-in-out infinite' }}>
                    🏴‍☠️
                </div>

                <h1
                    style={{
                        fontSize: 'clamp(5rem, 15vw, 9rem)',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #FF4444, #B026FF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1,
                        marginBottom: '0.25rem',
                    }}
                >
                    404
                </h1>

                <p style={{
                    fontSize: '1.3rem',
                    color: '#00D9FF',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: '0.75rem',
                }}>
                    Page Not Found
                </p>

                <p style={{
                    color: '#666',
                    fontSize: '0.95rem',
                    marginBottom: '2.5rem',
                    fontFamily: 'Rajdhani, sans-serif',
                    maxWidth: '380px',
                }}>
                    This sea route doesn't exist, pirate. Even the Grand Line has limits.
                </p>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '14px 40px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #FFD700, #FF6600)',
                        border: 'none',
                        color: '#000',
                        fontSize: '1rem',
                        fontWeight: 800,
                        fontFamily: 'Audiowide, sans-serif',
                        cursor: 'pointer',
                        boxShadow: '0 0 30px #FFD70050',
                        letterSpacing: '0.05em',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.07)';
                        e.currentTarget.style.boxShadow = '0 0 50px #FFD70080';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 0 30px #FFD70050';
                    }}
                >
                    🏠 Return to Home
                </button>
            </div>
        </div>
    );
};

export default NotFound;
