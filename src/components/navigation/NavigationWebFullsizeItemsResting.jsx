// figma node: 12070:3036 Navigation Web / Fullsize Items / Resting
export function NavigationWebFullsizeItemsResting(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 242,
      height: 64,
      backgroundColor: "rgb(255,255,255)",
      position: "relative",
      ...props.style,
    }}>
      <span style={{
        position: "absolute",
        left: 82,
        top: 20,
        width: 69,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Dashboard"}</span>
      <span style={{
        position: "absolute",
        left: 32,
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
      }}>{props.text2 ?? ""}</span>
    </div>
  );
}
export default NavigationWebFullsizeItemsResting;
