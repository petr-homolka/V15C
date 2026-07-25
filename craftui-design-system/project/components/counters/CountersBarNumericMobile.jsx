// figma node: 12070:2146 Counters / Bar Numeric / Mobile
export function CountersBarNumericMobile(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 124,
      height: 150,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 124,
        height: 150,
        borderRadius: 12,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <span style={{
        position: "absolute",
        left: 95,
        top: 14,
        width: 16,
        height: 16,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 16,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(124,231,172)",
      }}>{props.text1 ?? ""}</span>
      <span style={{
        position: "absolute",
        left: 37,
        top: 49,
        width: 51,
        height: 32,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 20,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "32px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "1.345"}</span>
      <span style={{
        position: "absolute",
        left: 46,
        top: 76,
        width: 32,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text3 ?? "Sales"}</span>
      <div style={{
        position: "absolute",
        left: 22,
        top: 126,
        width: 80,
        height: 4,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 80,
          height: 4,
          borderRadius: 3,
          backgroundColor: "rgb(245,245,250)",
        }} />
        <svg width={66.796} height={4} viewBox="0 0 66.796 4" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 66.796,
          height: 4,
          borderRadius: 3,
          color: "rgb(124,231,172)",
        }}>
          <path d={"M 0 2 C 0 0.895 0.895 0 2 0 L 64.796 0 C 65.901 0 66.796 0.895 66.796 2 C 66.796 3.105 65.901 4 64.796 4 L 2 4 C 0.895 4 0 3.105 0 2 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
      </div>
    </div>
  );
}
export default CountersBarNumericMobile;
