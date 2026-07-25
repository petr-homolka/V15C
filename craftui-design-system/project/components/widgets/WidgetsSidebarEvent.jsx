// figma node: 12068:2417 Widgets / Sidebar / Event
export function WidgetsSidebarEvent(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 317,
      height: 72,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 1,
        top: 0,
        width: 315,
        height: 72,
        borderRadius: 10,
        backgroundColor: "rgba(245,245,250,0.4)",
      }} />
      <span style={{
        position: "absolute",
        left: 270,
        top: 27,
        width: 25,
        height: 18,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 12,
        textAlign: "right",
        whiteSpace: "nowrap",
        lineHeight: "18px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "10m"}</span>
      <span style={{
        position: "absolute",
        left: 70,
        top: 25,
        width: 105,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "Nicholas Gordon"}</span>
      <div style={{
        position: "absolute",
        left: 19,
        top: 17,
        width: 38,
        height: 38,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 38,
          height: 38,
          borderRadius: 8,
          background: "linear-gradient(rgba(94,129,244,0.1),rgba(94,129,244,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
        }} />
        <span style={{
          position: "absolute",
          left: 10,
          top: 10,
          width: 18,
          height: 18,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(94,129,244)",
        }}>{props.text3 ?? ""}</span>
      </div>
    </div>
  );
}
export default WidgetsSidebarEvent;
