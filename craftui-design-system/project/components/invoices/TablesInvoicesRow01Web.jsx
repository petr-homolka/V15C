// figma node: 12070:3376 Tables / Invoices / Row 01 / Web
export function TablesInvoicesRow01Web(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 1140,
      height: 86,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1140,
        height: 86,
        borderRadius: 12,
        backgroundColor: "rgb(255,255,255)",
        boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
      }} />
      <span style={{
        position: "absolute",
        left: 985,
        top: 31,
        width: 69,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        textAlign: "right",
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "$1890.00"}</span>
      <div style={{
        position: "absolute",
        left: 823,
        top: 25,
        width: 114,
        height: 36,
      }}>
        <svg width={114} height={36} viewBox="0 0 114 36" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 114,
          height: 36,
          borderRadius: 8,
        }}>
          <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 106 0 C 110.418 0 114 3.582 114 8 L 114 28 C 114 32.418 110.418 36 106 36 L 8 36 C 3.582 36 0 32.418 0 28 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 42.071,
          top: 7,
          width: 28,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(94,129,244)",
        }}>Paid</span>
      </div>
      <div style={{
        position: "absolute",
        left: 484,
        top: 25,
        display: "flex",
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        flexWrap: "nowrap",
      }}>
        <div style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: 6,
          flexShrink: 0,
        }} />
        <span style={{
          position: "relative",
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          whiteSpace: "nowrap",
          lineHeight: "24px",
          color: "rgb(28,29,33)",
          flexShrink: 0,
        }}>{props.text2 ?? "Jeanette Hines"}</span>
      </div>
      <span style={{
        position: "absolute",
        left: 302,
        top: 31,
        width: 86,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 16,
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>{props.text3 ?? "11 Jan 2019"}</span>
      <span style={{
        position: "absolute",
        left: 92,
        top: 31,
        width: 114,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>{props.text4 ?? "AA-04-19-1890"}</span>
      <div style={{
        position: "absolute",
        left: 20,
        top: 17,
        width: 52,
        height: 52,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 52,
          height: 52,
          borderRadius: 8,
          background: "linear-gradient(rgba(94,129,244,0.1),rgba(94,129,244,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
        }} />
        <span style={{
          position: "absolute",
          left: 18,
          top: 17,
          width: 18,
          height: 18,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(94,129,244)",
        }}></span>
      </div>
      <div style={{
        position: "absolute",
        left: 1082,
        top: 25,
        width: 36,
        height: 36,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: "rgb(255,255,255)",
          boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
        }} />
        <span style={{
          position: "absolute",
          left: 9,
          top: 9,
          width: 18,
          height: 18,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}></span>
      </div>
    </div>
  );
}
export default TablesInvoicesRow01Web;
