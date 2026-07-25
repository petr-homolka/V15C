// figma node: 12068:122 Tabs / Icon / RestingTab
export function TabsIconRestingTab(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 111,
      height: 40,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 111,
        height: 40,
        borderRadius: 8,
        background: "linear-gradient(rgba(94,129,244,0.1),rgba(94,129,244,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
      }} />
      <span style={{
        position: "absolute",
        left: 40,
        top: 13,
        width: 33,
        height: 14,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 900,
        fontSize: 12,
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(94,129,244)",
        textTransform: "uppercase",
      }}>{props.text1 ?? "Tab 2"}</span>
      <span style={{
        position: "absolute",
        left: 17,
        top: 12,
        width: 16,
        height: 16,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 16,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(94,129,244)",
      }}>{props.text2 ?? ""}</span>
    </div>
  );
}
export default TabsIconRestingTab;
