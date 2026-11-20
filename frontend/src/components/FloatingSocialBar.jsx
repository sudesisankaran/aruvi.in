import React, { useState } from 'react';

export default function FloatingSocialBar() {
  const [hoveredItem, setHoveredItem] = useState(null);

  const socialLinks = [
    {
      id: 'youtube',
      title: 'YouTube',
      subtitle: '@aruvicollections.25',
      url: 'https://www.youtube.com/@aruvicollections.25',
      bgColor: '#FF0000',
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      id: 'instagram',
      title: 'Instagram',
      subtitle: '@_aruvi_collections',
      url: 'https://www.instagram.com/_aruvi_collections?rpxt=MThzbGIyd2k1Zzlieg%3D%3D',
      bgGradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <circle cx="17.5" cy="6.5" r="1.2" fill="white" stroke="none" />
        </svg>
      )
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Join Community Group',
      url: 'https://chat.whatsapp.com/CSmyr58NDTCJbKax4uy73k',
      bgColor: '#25D366',
      icon: (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
          <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.1-.475-.15-.676.15-.2.301-.776.98-1.002 1.256-.226.276-.451.301-.752.15-.301-.15-1.27-.468-2.42-1.493-.896-.799-1.5-1.786-1.676-2.087-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.15-.175.2-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.676-1.63-.927-2.232-.244-.587-.493-.507-.677-.516-.175-.008-.376-.01-.577-.01-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.228 3.11.15.2 2.12 3.238 5.136 4.54.718.31 1.278.496 1.715.635.72.23 1.375.197 1.893.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.126-.276-.201-.577-.351zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.981-1.408C8.447 21.495 10.18 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
        </svg>
      )
    },
    {
      id: 'call',
      title: 'Call Us',
      subtitle: '861 063 8978',
      url: 'tel:+918610638978',
      bgColor: '#0e2920',
      border: '1.5px solid #c89d38',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f6e05e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      )
    },
    {
      id: 'google',
      title: 'Google Maps',
      subtitle: 'Atelier Location',
      url: 'https://www.google.com/maps/place//@12.518781,78.0248576,17z/data=!3m1!4b1!4m3!3m2!1s0x3bac2d66280249cb:0xfc286c23e03d1527!12e1?entry=ttu&g_ep=EgoyMDI2MTExOC4wIKXMDSoASAFQAw%3D%3D',
      bgColor: '#ffffff',
      border: '1px solid #e2e8f0',
      icon: (
        <svg viewBox="0 0 48 48" width="24" height="24">
          <path fill="#4285F4" d="M24 4C14.06 4 6 12.06 6 22c0 8.04 5.3 14.86 12.63 17.13L24 44l5.37-4.87C36.7 36.86 42 30.04 42 22 42 12.06 33.94 4 24 4z"/>
          <circle fill="#FFFFFF" cx="24" cy="20" r="7"/>
          <circle fill="#EA4335" cx="24" cy="20" r="4.2"/>
        </svg>
      )
    }
  ];

  return (
    <aside 
      aria-label="Quick Connect & Social Channels"
      style={{
        position: 'fixed',
        right: '18px',
        bottom: '24px',
        zIndex: 9990,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'flex-end',
        pointerEvents: 'none'
      }}
    >
      {socialLinks.map((item) => {
        const isHovered = hoveredItem === item.id;
        return (
          <div 
            key={item.id}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'auto'
            }}
            onMouseEnter={() => setHoveredItem(item.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Tooltip on hover */}
            <div
              style={{
                position: 'absolute',
                right: '54px',
                whiteSpace: 'nowrap',
                background: '#0e2920',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                border: '1px solid rgba(200,157,56,0.4)',
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'translateX(0)' : 'translateX(8px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{item.title}:</span>
              <span style={{ color: '#c89d38' }}>{item.subtitle}</span>
            </div>

            {/* Circular Floating Button */}
            <a
              href={item.url}
              target={item.id === 'call' ? '_self' : '_blank'}
              rel="noopener noreferrer"
              aria-label={`${item.title} - ${item.subtitle}`}
              title={`${item.title} - ${item.subtitle}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: item.bgGradient || item.bgColor,
                border: item.border || 'none',
                boxShadow: isHovered 
                  ? '0 6px 20px rgba(0,0,0,0.35)' 
                  : '0 3px 12px rgba(0,0,0,0.2)',
                transform: isHovered ? 'scale(1.12) translateX(-3px)' : 'scale(1)',
                transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease',
                cursor: 'pointer',
                textDecoration: 'none'
              }}
            >
              {item.icon}
            </a>
          </div>
        );
      })}
    </aside>
  );
}
