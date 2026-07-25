// figma node: 12070:2988 Navigation Mobile / Items / Active
export function NavigationMobileItemsActive(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 56,
      height: 77,
      backgroundColor: "rgb(255,255,255)",
      position: "relative",
      color: "rgb(94,129,244)",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 4,
        top: 15,
        width: 48,
        height: 48,
        borderRadius: 4,
        background: "linear-gradient(rgba(94,129,244,0.1),rgba(94,129,244,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
      }} />
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
        color: "rgb(94,129,244)",
      }}>{props.text1 ?? ""}</span>
      <svg width={2} height={48} viewBox="0 0 2 48" fill="none" style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: "matrix(0,-1,1,0,4,2)",
        transformOrigin: "0 0",
        width: 2,
        height: 48,
        borderRadius: 1,
      }}>
        <path d={"M 0 1 C 0 0.448 0.448 0 1 0 C 1.552 0 2 0.448 2 1 L 2 47 C 2 47.552 1.552 48 1 48 C 0.448 48 0 47.552 0 47 L 0 1 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
    </div>
  );
}
export default NavigationMobileItemsActive;
