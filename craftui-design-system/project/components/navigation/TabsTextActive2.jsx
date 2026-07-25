// figma node: 12070:4296 Tabs/Text/Active
export function TabsTextActive2(_p = {}) {
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
        backgroundColor: "rgb(255,255,255)",
        boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
      }} />
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
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "Tab Title"}</span>
    </div>
  );
}
export default TabsTextActive2;
