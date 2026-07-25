// figma node: 12068:2409 Widgets / Sidebar / Calendar Event
export function WidgetsSidebarCalendarEvent(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 317,
      height: 90,
      position: "relative",
      color: "rgb(94,129,244)",
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
        left: 287,
        top: 16,
        width: 16,
        height: 16,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 16,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? ""}</span>
      <span style={{
        position: "absolute",
        left: 21,
        top: 56,
        width: 208,
        height: 18,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 12,
        lineHeight: "18px",
        color: "rgb(129,129,165)",
      }}>{props.text2 ?? "Tell how to boost website traffic"}</span>
      <span style={{
        position: "absolute",
        left: 22,
        top: 36,
        width: 248,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text3 ?? "Meeting with a client"}</span>
      <div style={{
        position: "absolute",
        left: 22,
        top: 14,
        display: "flex",
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
        flexWrap: "nowrap",
      }}>
        <svg width={8} height={8} viewBox="0 0 8 8" fill="none" style={{
          position: "relative",
          width: 8,
          height: 8,
          flexShrink: 0,
        }}>
          <path d={"M 4 8 C 6.209 8 8 6.209 8 4 C 8 1.791 6.209 0 4 0 C 1.791 0 0 1.791 0 4 C 0 6.209 1.791 8 4 8 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "relative",
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          whiteSpace: "nowrap",
          lineHeight: "18px",
          color: "rgb(94,129,244)",
          flexShrink: 0,
        }}>{props.text4 ?? "05:48AM"}</span>
      </div>
    </div>
  );
}
export default WidgetsSidebarCalendarEvent;
