import React from 'react';

/**
 * Unifikovaný profilový modal pro zobrazení detailu libovolné entity (Dítě, Pěstoun, KO/Zaměstnanec, Rodina).
 */
export function EntityProfileModal({ entity, onClose, onNavigateToFamily }) {
  if (!entity) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(28,29,33,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '540px',
        width: '100%',
        padding: '32px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Zavírací tlačítko */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#F7F9FC',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#1C1D21'
          }}
        >
          <i className="las la-times"></i>
        </button>

        {/* PROFIL DÍTĚTE */}
        {entity.type === 'child' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(74,133,246,0.12)',
                color: '#4A85F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800
              }}>
                <i className="las la-smile"></i>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#4A85F6', textTransform: 'uppercase' }}>KARTA SVĚŘENÉHO DÍTĚTE</span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 800, color: '#1C1D21', fontFamily: 'var(--font-display)' }}>
                  {entity.name}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', backgroundColor: '#F7F9FC', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
              <div><strong>Rodné číslo:</strong> {entity.rc || '140512/1234'}</div>
              <div><strong>Datum narození:</strong> {entity.birthDate || '12.05.2014'} (Věk: {2026 - (entity.birthYear || 2014)} let)</div>
              <div><strong>Pěstounská rodina:</strong> {entity.family || entity.familyName || 'Petr a Anna Dvořákovi'}</div>
              <div><strong>Příslušný OSPOD:</strong> {entity.ospod || 'OSPOD Praha 4'}</div>
              <div><strong>Škola / Školské zařízení:</strong> {entity.school || 'ZŠ Křesomyslova'}</div>
              <div><strong>Klíčová osoba:</strong> {entity.ko || 'Mgr. Jana Nováková'}</div>
            </div>
          </div>
        )}

        {/* PROFIL KLÍČOVÉ OSOBY / ZAMĚSTNANCE */}
        {entity.type === 'staff' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#4A85F6',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 800
              }}>
                {entity.name.split(' ').map(n => n[0]).slice(-2).join('')}
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#4A85F6', textTransform: 'uppercase' }}>PROFIL ZAMĚSTNANCE / KO</span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 800, color: '#1C1D21', fontFamily: 'var(--font-display)' }}>
                  {entity.name}
                </h2>
                <span style={{ fontSize: '13px', color: '#8181A5' }}>{entity.role}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', backgroundColor: '#F7F9FC', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
              <div><i className="las la-phone" style={{ color: '#4A85F6' }}></i> <strong>Telefon:</strong> {entity.phone || '+420 777 123 456'}</div>
              <div><i className="las la-envelope" style={{ color: '#4A85F6' }}></i> <strong>E-mail:</strong> {entity.email || 'jana.novakova@doprovazeni.cz'}</div>
              <div><i className="las la-folder-open" style={{ color: '#4A85F6' }}></i> <strong>Spravované rodiny:</strong> {entity.activeFamilies || 12} rodin v doprovázení</div>
              <div><i className="las la-user-check" style={{ color: '#4A85F6' }}></i> <strong>Kapacita:</strong> 12 / 15 rodin (Volná kapacita: 3)</div>
            </div>
          </div>
        )}

        {/* PROFIL PĚSTOUNA */}
        {entity.type === 'foster' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(39,185,115,0.12)',
                color: '#27B973',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 800
              }}>
                <i className="las la-hand-holding-heart"></i>
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#27B973', textTransform: 'uppercase' }}>PROFIL PĚSTOUNSKÉ RODINY</span>
                <h2 style={{ margin: '2px 0 0 0', fontSize: '20px', fontWeight: 800, color: '#1C1D21', fontFamily: 'var(--font-display)' }}>
                  {entity.name || entity.fosterParents}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', backgroundColor: '#F7F9FC', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
              <div><strong>Telefonní kontakt:</strong> {entity.phone || '+420 777 111 222'}</div>
              <div><strong>E-mail:</strong> {entity.email || 'dvorakovi@seznam.cz'}</div>
              <div><strong>Adresa / Lokalita:</strong> {entity.city || 'Praha 4'}</div>
              <div><strong>Počet dětí v péči:</strong> {entity.childrenCount || 2} děti</div>
              <div><strong>Přiřazená Klíčová osoba:</strong> {entity.assignedTo || entity.ko || 'Mgr. Jana Nováková'}</div>
            </div>
          </div>
        )}

        {/* Akční tlačítko Zavřít / Převést na spis */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#4A85F6',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Zavřít detail
          </button>
        </div>
      </div>
    </div>
  );
}
export default EntityProfileModal;
