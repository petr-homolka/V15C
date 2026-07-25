// figma node: 12070:2209 Counters / Progress
export function CountersProgress(_p = {}) {
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
        left: 30,
        top: 74,
        width: 302,
        height: 4,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 302,
          height: 4,
          borderRadius: 3,
          backgroundColor: "rgb(245,245,250)",
        }} />
        <svg width={252.155} height={4} viewBox="0 0 252.155 4" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 252.155,
          height: 4,
          borderRadius: 3,
          color: "rgb(124,231,172)",
        }}>
          <path d={"M 0 2 C 0 0.895 0.895 0 2 0 L 250.155 0 C 251.26 0 252.155 0.895 252.155 2 C 252.155 3.105 251.26 4 250.155 4 L 2 4 C 0.895 4 0 3.105 0 2 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
      </div>
      <span style={{
        position: "absolute",
        left: 304,
        top: 43,
        width: 28,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        textAlign: "right",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "85%"}</span>
      <span style={{
        position: "absolute",
        left: 30,
        top: 33,
        width: 51,
        height: 32,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 20,
        whiteSpace: "nowrap",
        lineHeight: "32px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "1.345"}</span>
      <span style={{
        position: "absolute",
        left: 30,
        top: 16,
        width: 62,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text3 ?? "New sales"}</span>
    </div>
  );
}
export default CountersProgress;
