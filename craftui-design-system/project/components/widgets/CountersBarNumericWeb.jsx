// figma node: 12068:2576 Counters / Bar Numeric / Web
export function CountersBarNumericWeb(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 360,
      height: 98,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 360,
        height: 98,
        borderRadius: 12,
        backgroundColor: "rgba(245,245,250,0.4)",
      }} />
      <div style={{
        position: "absolute",
        left: 267,
        top: 22,
        display: "flex",
        flexDirection: "row",
        gap: 4,
        justifyContent: "flex-end",
        alignItems: "center",
        flexWrap: "nowrap",
      }}>
        <span style={{
          position: "relative",
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          textAlign: "right",
          whiteSpace: "nowrap",
          lineHeight: "32px",
          color: "rgb(28,29,33)",
          flexShrink: 0,
        }}>{props.text1 ?? "1.345"}</span>
        <span style={{
          position: "relative",
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(124,231,172)",
          flexShrink: 0,
        }}>{props.text2 ?? ""}</span>
      </div>
      <span style={{
        position: "absolute",
        left: 26,
        top: 38,
        width: 111,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text3 ?? "Week comparison"}</span>
      <span style={{
        position: "absolute",
        left: 26,
        top: 14,
        width: 42,
        height: 27,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 18,
        whiteSpace: "nowrap",
        lineHeight: "27px",
        color: "rgb(28,29,33)",
      }}>{props.text4 ?? "Sales"}</span>
      <div style={{
        position: "absolute",
        left: 25.5,
        top: 74,
        width: 311,
        height: 4,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 311,
          height: 4,
          borderRadius: 3,
          backgroundColor: "rgb(245,245,250)",
        }} />
        <svg width={259.670} height={4} viewBox="0 0 259.670 4" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 259.67,
          height: 4,
          borderRadius: 3,
          color: "rgb(124,231,172)",
        }}>
          <path d={"M 0 2 C 0 0.895 0.895 0 2 0 L 257.67 0 C 258.774 0 259.67 0.895 259.67 2 L 259.67 2 C 259.67 3.105 258.774 4 257.67 4 L 2 4 C 0.895 4 0 3.105 0 2 L 0 2 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
      </div>
    </div>
  );
}
export default CountersBarNumericWeb;
