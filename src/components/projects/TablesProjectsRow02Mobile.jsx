// figma node: 12070:3643 Tables / Projects / Row 02 / Mobile
export function TablesProjectsRow02Mobile(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 348,
      height: 74,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 348,
        height: 74,
        borderRadius: 12,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <span style={{
        position: "absolute",
        left: 80,
        top: 15,
        width: 53,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "Project"}</span>
      <span style={{
        position: "absolute",
        left: 80,
        top: 37,
        width: 83,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text2 ?? "Development"}</span>
      <div style={{
        position: "absolute",
        left: 234,
        top: 20,
        width: 100,
        height: 34,
      }}>
        <svg width={100} height={34} viewBox="0 0 100 34" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 100,
          height: 34,
          borderRadius: 8,
          color: "rgb(245,245,250)",
        }}>
          <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 92 0 C 96.418 0 100 3.582 100 8 L 100 26 C 100 30.418 96.418 34 92 34 L 8 34 C 3.582 34 0 30.418 0 26 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 11,
          top: 6,
          width: 78,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>24 Feb 2019</span>
      </div>
      <div style={{
        position: "absolute",
        left: 14,
        top: 11,
        width: 52,
        height: 52,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 52,
          height: 52,
          borderRadius: 6,
          backgroundColor: "rgb(245,245,250)",
        }} />
        <span style={{
          position: "absolute",
          left: 14.7,
          top: 15,
          width: 22,
          height: 22,
          fontFamily: "\"la-brands-400\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 22,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(255,128,139)",
        }}></span>
      </div>
    </div>
  );
}
export default TablesProjectsRow02Mobile;
