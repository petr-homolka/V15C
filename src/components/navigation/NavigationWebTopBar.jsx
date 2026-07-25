// figma node: 12068:2164 Navigation Web / Top Bar
export function NavigationWebTopBar(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: "100%",
      height: 84,
      position: "relative",
      borderBottom: "1px solid rgb(240,240,243)",
      backgroundColor: "rgb(255,255,255)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 28px",
      boxSizing: "border-box",
      ...props.style,
    }}>
      {/* Levá část: Název stránky / Drobečky / Tlačítko zpět */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}>
        {props.onBack && (
          <span
            onClick={props.onBack}
            style={{
              cursor: "pointer",
              color: "var(--accent-primary)",
              fontWeight: 700,
              fontSize: "18px",
              marginRight: "8px",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <i className="las la-angle-left"></i> Zpět
          </span>
        )}
        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "22px",
          color: "rgb(28,29,33)",
        }}>
          {props.title || props.text4 || "Doprovázení.com"}
        </span>
      </div>

      {/* Pravá část: Ikony vyhledávání a upozornění */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        {/* Vyhledávání */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          backgroundColor: "rgb(240,240,243)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}>
          <span style={{
            fontFamily: "\"la-solid-900\", sans-serif",
            fontSize: 16,
            color: "rgb(129,129,165)",
          }}></span>
        </div>

        {/* Notifikace */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 6,
          backgroundColor: "rgb(240,240,243)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}>
          <span style={{
            fontFamily: "\"la-solid-900\", sans-serif",
            fontSize: 16,
            color: "rgb(129,129,165)",
          }}></span>
        </div>
      </div>
    </div>
  );
}
export default NavigationWebTopBar;
