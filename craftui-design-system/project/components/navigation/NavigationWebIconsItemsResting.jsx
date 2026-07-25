// figma node: 12068:2175 Navigation Web / Icons Items / Resting
export function NavigationWebIconsItemsResting(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 78,
      height: 64,
      backgroundColor: "rgb(255,255,255)",
      position: "relative",
      ...props.style,
    }}>
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
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? ""}</span>
    </div>
  );
}
export default NavigationWebIconsItemsResting;
