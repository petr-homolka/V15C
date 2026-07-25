// figma node: 12070:2992 Navigation Mobile / Items / Resting
export function NavigationMobileItemsResting(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 56,
      height: 77,
      backgroundColor: "rgb(255,255,255)",
      position: "relative",
      ...props.style,
    }}>
      <span style={{
        position: "absolute",
        left: 17,
        top: 28,
        width: 22,
        height: 22,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 22,
        textAlign: "center",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? ""}</span>
    </div>
  );
}
export default NavigationMobileItemsResting;
