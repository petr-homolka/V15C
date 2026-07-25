// figma node: 12068:2210 Graphs/Graph Sidebar
export function GraphsGraphSidebar(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 324,
      height: 208,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 324,
        height: 208,
        borderRadius: 12,
        backgroundColor: "rgba(245,245,250,0.4)",
      }} />
      <div style={{
        position: "absolute",
        left: 1,
        top: 25,
        width: 322,
        height: 182,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 322,
          height: 182,
          opacity: 0,
          borderRadius: 10,
          backgroundColor: "rgb(216,216,216)",
        }} />
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 322,
          height: 182,
          clipPath: "inset(0px 0px 0px 0px round 10px)",
        }}>
          <svg width={392} height={148} viewBox="0 0 392 148" fill="none" style={{
            position: "absolute",
            left: -70,
            top: 69,
            width: 392,
            height: 148,
            opacity: 0.1,
            color: "rgb(77,76,172)",
          }}>
            <path d={"M 0 89.848 C 0 89.848 24.944 125.661 42.349 118.715 C 59.754 111.769 72.598 69.654 89.611 69.654 C 106.624 69.654 121.682 80.013 142.9 57.013 C 164.117 34.013 167.622 2.4 193.161 2.4 C 218.701 2.4 251.534 70.282 285.799 18.381 C 320.065 -33.519 392 61.121 392 61.121 L 392 148 L 0 148 L 0 89.848 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <svg width={392} height={93} viewBox="0 0 392 93" fill="none" style={{
            position: "absolute",
            left: -40,
            top: 90,
            width: 392,
            height: 93,
            color: "rgb(94,129,244)",
          }}>
            <path d={"M 0 56.458 C 0 56.458 24.944 78.962 42.349 74.598 C 59.754 70.233 72.598 43.769 89.611 43.769 C 106.624 43.769 121.682 50.278 142.9 35.826 C 164.117 21.373 167.622 1.508 193.161 1.508 C 218.701 1.508 251.534 44.163 285.799 11.551 C 320.065 -21.062 392 38.407 392 38.407 L 392 93 L 0 93 L 0 56.458 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
        </div>
      </div>
      <span style={{
        position: "absolute",
        left: 21,
        top: 44,
        width: 170,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Week to week performance"}</span>
      <span style={{
        position: "absolute",
        left: 21,
        top: 22,
        width: 136,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "Conversion history"}</span>
      <div style={{
        position: "absolute",
        left: 262,
        top: 21,
        width: 42,
        height: 42,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 42,
          height: 42,
          borderRadius: 8,
          backgroundColor: "rgb(94,129,244)",
        }} />
        <span style={{
          position: "absolute",
          left: 11.783,
          top: 11,
          width: 18,
          height: 18,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(150,152,214)",
        }}></span>
      </div>
    </div>
  );
}
export default GraphsGraphSidebar;
