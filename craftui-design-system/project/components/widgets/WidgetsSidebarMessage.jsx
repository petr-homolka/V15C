// figma node: 12068:2220 Widgets / Sidebar / Message
export function WidgetsSidebarMessage(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 317,
      height: 90,
      position: "relative",
      color: "rgb(124,231,172)",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 317,
        height: 90,
        borderRadius: 12,
        backgroundColor: "rgba(245,245,250,0.4)",
      }} />
      <span style={{
        position: "absolute",
        left: 78,
        top: 38,
        width: 203,
        height: 36,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 12,
        lineHeight: "18px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Moreover the striking, brilliant and vivid colors"}</span>
      <span style={{
        position: "absolute",
        left: 270,
        top: 16,
        width: 25,
        height: 18,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 12,
        textAlign: "right",
        lineHeight: "18px",
        color: "rgb(129,129,165)",
      }}>{props.text2 ?? "10m"}</span>
      <span style={{
        position: "absolute",
        left: 78,
        top: 15,
        width: 105,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text3 ?? "Nicholas Gordon"}</span>
      <div style={{
        position: "absolute",
        left: 21,
        top: 20,
        width: 40,
        height: 43,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 38,
          height: 38,
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 38,
            height: 38,
            borderRadius: 5,
          }} />
        </div>
        <div style={{
          position: "absolute",
          left: 30,
          top: 33,
          width: 10,
          height: 10,
          overflow: "hidden",
        }}>
          <svg width={10} height={10} viewBox="0 0 10 10" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 10,
            height: 10,
          }}>
            <path d={"M 5 10 C 7.761 10 10 7.761 10 5 C 10 2.239 7.761 0 5 0 C 2.239 0 0 2.239 0 5 C 0 7.761 2.239 10 5 10 Z"} fill="rgb(124,231,172)" fillRule="nonzero" />
            <path d={"M 5 10 L 5 10.5 C 8.038 10.5 10.5 8.038 10.5 5 L 10 5 L 9.5 5 C 9.5 7.485 7.485 9.5 5 9.5 L 5 10 Z M 10 5 L 10.5 5 C 10.5 1.962 8.038 -0.5 5 -0.5 L 5 0 L 5 0.5 C 7.485 0.5 9.5 2.515 9.5 5 L 10 5 Z M 5 0 L 5 -0.5 C 1.962 -0.5 -0.5 1.962 -0.5 5 L 0 5 L 0.5 5 C 0.5 2.515 2.515 0.5 5 0.5 L 5 0 Z M 0 5 L -0.5 5 C -0.5 8.038 1.962 10.5 5 10.5 L 5 10 L 5 9.5 C 2.515 9.5 0.5 7.485 0.5 5 L 0 5 Z"} fill="rgb(255,255,255)" fillRule="nonzero" />
          </svg>
        </div>
      </div>
    </div>
  );
}
export default WidgetsSidebarMessage;
