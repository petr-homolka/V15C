// figma node: 12068:5 UI Kit Header
export function UIKitHeader(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 1440,
      height: 104,
      position: "relative",
      color: "rgb(236,236,242)",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: -5,
        width: 1440,
        height: 109,
        overflow: "hidden",
      }}>
        <svg width={1440} height={2} viewBox="0 0 1440 2" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 107,
          width: 1440,
          height: 2,
        }}>
          <path d={"M 0 0.5 L -0.5 0.5 L -0.5 1.5 L 0 1.5 L 0 1 L 0 0.5 Z M 1440 1.5 L 1440.5 1.5 L 1440.5 0.5 L 1440 0.5 L 1440 1 L 1440 1.5 Z M 0 1 L 0 1.5 L 1440 1.5 L 1440 1 L 1440 0.5 L 0 0.5 L 0 1 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 150,
          top: 0,
          width: 66,
          height: 42,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 32,
          whiteSpace: "nowrap",
          lineHeight: "42px",
          color: "rgb(28,29,33)",
        }}>{props.text1 ?? "Title"}</span>
      </div>
    </div>
  );
}
export default UIKitHeader;
