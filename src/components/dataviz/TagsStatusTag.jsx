// figma node: 12068:132 Tags / Status tag
export function TagsStatusTag(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 75,
      height: 28,
      position: "relative",
      ...props.style,
    }}>
      <svg width={75} height={28} viewBox="0 0 75 28" fill="none" style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 75,
        height: 28,
        borderRadius: 6,
        color: "rgb(245,245,250)",
      }}>
        <path d={"M 0 6 C 0 2.686 2.686 0 6 0 L 69 0 C 72.314 0 75 2.686 75 6 L 75 22 C 75 25.314 72.314 28 69 28 L 6 28 C 2.686 28 0 25.314 0 22 L 0 6 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
      <span style={{
        position: "absolute",
        left: 23,
        top: 3,
        width: 42,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Online"}</span>
      <svg width={8} height={8} viewBox="0 0 8 8" fill="none" style={{
        position: "absolute",
        left: 9,
        top: 10,
        width: 8,
        height: 8,
        color: "rgb(124,231,172)",
      }}>
        <path d={"M 4 8 C 6.209 8 8 6.209 8 4 C 8 1.791 6.209 0 4 0 C 1.791 0 0 1.791 0 4 C 0 6.209 1.791 8 4 8 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
    </div>
  );
}
export default TagsStatusTag;
