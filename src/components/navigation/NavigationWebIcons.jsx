import React, { useState } from 'react';

export function NavigationWebIcons(_p = {}) {
  const props = _p;
  const [isExpanded, setIsExpanded] = useState(false);

  const orgInitial = props.orgName ? props.orgName.charAt(0).toUpperCase() : 'D';
  const accentColor = props.branding?.accentPreset === 'green' ? 'var(--status-success)' : 'rgb(94,129,244)';

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const menuItems = [
    { icon: "", label: "Dashboard", active: true },
    { icon: "", label: "Dohody" },
    { icon: "", label: "Úkoly" },
    { icon: "", label: "Kalendář" },
    { icon: "", label: "Adresář" },
    { icon: "", label: "Soubory" },
    { icon: "", label: "Zprávy", badge: "rgba(138,241,185,1)" },
    { icon: "", label: "Služby" },
    { icon: "", label: "Účetnictví" },
    { icon: "", label: "Upozornění", badge: "rgba(255,128,139,1)" }
  ];

  return (
    <div className={props.className} style={{
      width: isExpanded ? 240 : 84,
      height: "100vh",
      backgroundColor: "rgb(255,255,255)",
      borderRight: "1px solid rgb(240,240,243)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: isExpanded ? "flex-start" : "center",
      padding: "24px 0",
      boxSizing: "border-box",
      flexShrink: 0,
      zIndex: 100,
      transition: "width 0.2s ease-in-out",
      ...props.style,
    }}>
      {/* Horní sekce: Logo a hlavní navigace */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isExpanded ? "flex-start" : "center",
        width: "100%",
        gap: "12px"
      }}>
        {/* Logo Placeholder (Kolečko s iniciálem a logem) */}
        <div 
          onClick={toggleSidebar}
          style={{
            width: "100%",
            padding: isExpanded ? "0 24px" : "0",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            cursor: "pointer"
          }}
          title={isExpanded ? "Zabalit menu" : "Rozbalit menu"}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "18px",
            boxShadow: "0 2px 8px rgba(94,129,244,0.3)"
          }}>
            {orgInitial}
          </div>
          {isExpanded && (
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "18px",
              color: "rgb(28,29,33)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {props.orgName || "Doprovázení"}
            </span>
          )}
        </div>

        {/* Hlavní menu položky */}
        {menuItems.map((item, idx) => {
          const isActive = item.active;
          return (
            <div 
              key={idx} 
              onClick={() => {
                if (!props.onNavigate) return;
                if (item.label === 'Dashboard') props.onNavigate('dashboard');
                else if (item.label === 'Soubory' || item.label === 'Účetnictví') props.onNavigate('import-export');
                else props.onNavigate('dashboard');
              }}
              style={{
                width: "100%",
                height: 52,
                position: "relative",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                paddingLeft: isExpanded ? "24px" : "0",
                justifyContent: isExpanded ? "flex-start" : "center"
              }}
            >
              {isActive && (
                <div style={{
                  position: "absolute",
                  left: isExpanded ? 18 : 18,
                  top: 2,
                  width: isExpanded ? 204 : 48,
                  height: 48,
                  borderRadius: 4,
                  background: "linear-gradient(rgba(94,129,244,0.1),rgba(94,129,244,0.1))",
                  zIndex: 1
                }} />
              )}
              
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                zIndex: 2
              }}>
                <span style={{
                  fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
                  fontWeight: 400,
                  fontSize: 22,
                  color: isActive ? accentColor : "rgb(129,129,165)",
                  width: "24px",
                  textAlign: "center"
                }}>{item.icon}</span>

                {isExpanded && (
                  <span style={{
                    fontSize: "var(--text-body)",
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? "rgb(28,29,33)" : "rgb(129,129,165)",
                    whiteSpace: "nowrap"
                  }}>
                    {item.label}
                  </span>
                )}
              </div>

              {/* Levý aktivní proužek */}
              {isActive && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: 2,
                  width: 3,
                  height: 48,
                  backgroundColor: accentColor,
                  borderRadius: "0 4px 4px 0",
                  zIndex: 3
                }} />
              )}
              
              {item.badge && !isExpanded && (
                <div style={{
                  position: "absolute",
                  top: 10,
                  right: 24,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: item.badge,
                  border: "2px solid #fff",
                  zIndex: 4
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Spodní sekce: Nastavení, Nápověda a Profil */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isExpanded ? "flex-start" : "center",
        width: "100%",
        gap: "12px",
        paddingLeft: isExpanded ? "24px" : "0"
      }}>
        {/* Nápověda */}
        <div style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: "16px",
          cursor: "pointer"
        }}>
          <span style={{
            fontFamily: "\"la-solid-900\", sans-serif",
            fontSize: 22,
            color: "rgb(129,129,165)",
            width: "24px",
            textAlign: "center"
          }}></span>
          {isExpanded && (
            <span style={{
              fontSize: "var(--text-body)",
              fontWeight: 600,
              color: "rgb(129,129,165)",
              whiteSpace: "nowrap"
            }}>
              Nápověda
            </span>
          )}
        </div>

        {/* Nastavení */}
        <div 
          onClick={() => { if (props.onNavigate) props.onNavigate('settings'); }}
          style={{
            height: 52,
            display: "flex",
            alignItems: "center",
            gap: "16px",
            cursor: "pointer"
          }}
        >
          <span style={{
            fontFamily: "\"la-solid-900\", sans-serif",
            fontSize: 22,
            color: "rgb(129,129,165)",
            width: "24px",
            textAlign: "center"
          }}>⚙️</span>
          {isExpanded && (
            <span style={{
              fontSize: "var(--text-body)",
              fontWeight: 600,
              color: "rgb(129,129,165)",
              whiteSpace: "nowrap"
            }}>
              Nastavení
            </span>
          )}
        </div>

        {/* Profil s online tečkou */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          cursor: "pointer",
          marginTop: "12px"
        }}>
          <div style={{
            width: 32,
            height: 32,
            position: "relative"
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              backgroundColor: "rgb(230,230,235)",
              backgroundSize: "cover",
              backgroundImage: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100')"
            }} />
            <div style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "rgb(124,231,172)",
              border: "2px solid #fff"
            }} />
          </div>
          {isExpanded && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{
                fontSize: "var(--text-body)",
                fontWeight: 700,
                color: "rgb(28,29,33)",
                whiteSpace: "nowrap"
              }}>
                {props.userName || "Jana Nováková"}
              </span>
              <span style={{
                fontSize: "var(--text-caption)",
                color: "rgb(129,129,165)",
                whiteSpace: "nowrap"
              }}>
                Klíčová osoba
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default NavigationWebIcons;
