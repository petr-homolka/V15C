// figma node: 12070:3613 Tables / Projects / Row 01 / Mobile
export function TablesProjectsRow01Mobile(_p = {}) {
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
        left: 300,
        top: 36,
        width: 34,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Tasks"}</span>
      <div style={{
        position: "absolute",
        left: 275,
        top: 16,
        display: "flex",
        flexDirection: "row",
        gap: 3,
        justifyContent: "flex-end",
        alignItems: "center",
        flexWrap: "nowrap",
      }}>
        <span style={{
          position: "relative",
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          textAlign: "right",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
          flexShrink: 0,
        }}>{props.text2 ?? "148 /"}</span>
        <span style={{
          position: "relative",
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 16,
          textAlign: "right",
          whiteSpace: "nowrap",
          lineHeight: "24px",
          color: "rgb(28,29,33)",
          flexShrink: 0,
        }}>{props.text3 ?? "90"}</span>
      </div>
      <span style={{
        position: "absolute",
        left: 81,
        top: 36,
        width: 83,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text4 ?? "Development"}</span>
      <span style={{
        position: "absolute",
        left: 81,
        top: 15,
        width: 53,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>Project</span>
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
export default TablesProjectsRow01Mobile;
