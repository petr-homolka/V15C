// figma node: 12068:126 Badge / Oval
export function BadgeOval(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 30,
      height: 24,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 30,
        height: 24,
        borderRadius: 12,
        background: "linear-gradient(rgba(124,231,172,0.1),rgba(124,231,172,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
      }} />
      <span style={{
        position: "absolute",
        left: 11,
        top: 1,
        width: 9,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(124,231,172)",
      }}>{props.text1 ?? "5"}</span>
    </div>
  );
}
export default BadgeOval;
