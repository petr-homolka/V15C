// figma node: 12068:120 Tabs/Text/Resting
export function TabsTextResting(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 111,
      height: 40,
      position: "relative",
      ...props.style,
    }}>
      <span style={{
        position: "absolute",
        left: 28.5,
        top: 10,
        width: 54,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Tab Title"}</span>
    </div>
  );
}
export default TabsTextResting;
