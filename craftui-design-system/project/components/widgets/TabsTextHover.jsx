// figma node: 12070:4301 Tabs/Text/Hover
export function TabsTextHover(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 88,
      height: 40,
      position: "relative",
      ...props.style,
    }}>
      <span style={{
        position: "absolute",
        left: 17.5,
        top: 10,
        width: 54,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(94,129,244)",
      }}>{props.text1 ?? "Tab Title"}</span>
    </div>
  );
}
export default TabsTextHover;
