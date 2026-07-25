import React from 'react';

/**
 * Interaktivní odkaz na profil entity (Dítě, Pěstoun, KO/Zaměstnanec, Rodina).
 */
export function EntityLink({ name, type = 'child', entityData, onClick }) {
  if (!name) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick({
        type,
        name,
        ...entityData
      });
    }
  };

  return (
    <span
      onClick={handleClick}
      title={`Otevřít profil: ${name}`}
      style={{
        color: '#4A85F6',
        fontWeight: 700,
        cursor: 'pointer',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'color 0.15s, text-decoration 0.15s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
    >
      <span>{name}</span>
      <i className="las la-external-link-alt" style={{ fontSize: '12px', opacity: 0.7 }}></i>
    </span>
  );
}
export default EntityLink;
