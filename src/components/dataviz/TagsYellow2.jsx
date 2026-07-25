// figma node: 12070:4331 Tags / Yellow
export function TagsYellow2(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 84,
      height: 36,
      position: "relative",
      ...props.style,
    }}>
      <svg width={84} height={36} viewBox="0 0 84 36" fill="none" style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 84,
        height: 36,
        borderRadius: 8,
      }}>
        <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 76 0 C 80.418 0 84 3.582 84 8 L 84 28 C 84 32.418 80.418 36 76 36 L 8 36 C 3.582 36 0 32.418 0 28 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
      <span style={{
        position: "absolute",
        left: 31,
        top: 7,
        width: 22,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(244,190,94)",
      }}>{props.text1 ?? "Tag"}</span>
    </div>
  );
}
export default TagsYellow2;
