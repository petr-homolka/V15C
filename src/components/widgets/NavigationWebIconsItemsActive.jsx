// figma node: 12068:2177 Navigation Web / Icons Items / Active
export function NavigationWebIconsItemsActive(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 78,
      height: 64,
      backgroundColor: "rgb(255,255,255)",
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 15,
        top: 8,
        width: 48,
        height: 48,
        borderRadius: 4,
        background: "linear-gradient(rgba(94,129,244,0.1),rgba(94,129,244,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
      }} />
      <span style={{
        position: "absolute",
        left: 28,
        top: 21,
        width: 22,
        height: 22,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 22,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(94,129,244)",
      }}>{props.text1 ?? ""}</span>
      <div style={{
        position: "absolute",
        left: 76,
        top: 8,
        width: 2,
        height: 48,
        borderRadius: 1,
        backgroundColor: "rgb(94,129,244)",
      }} />
    </div>
  );
}
export default NavigationWebIconsItemsActive;
