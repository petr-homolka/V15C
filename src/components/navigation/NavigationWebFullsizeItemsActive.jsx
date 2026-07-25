// figma node: 12070:3031 Navigation Web / Fullsize Items / Active
export function NavigationWebFullsizeItemsActive(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 242,
      height: 64,
      backgroundColor: "rgb(255,255,255)",
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 240,
        top: 8,
        width: 2,
        height: 48,
        borderRadius: 1,
        backgroundColor: "rgb(94,129,244)",
      }} />
      <div style={{
        position: "absolute",
        left: 19,
        top: 8,
        width: 202,
        height: 48,
        borderRadius: 4,
        background: "linear-gradient(rgba(94,129,244,0.1),rgba(94,129,244,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
      }} />
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
        color: "rgb(94,129,244)",
      }}>{props.text1 ?? ""}</span>
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
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "Dashboard"}</span>
    </div>
  );
}
export default NavigationWebFullsizeItemsActive;
