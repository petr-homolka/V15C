// figma node: 12068:70 Tags / GreyEditable
export function TagsGreyEditable(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 86,
      height: 36,
      position: "relative",
      color: "rgb(245,245,250)",
      ...props.style,
    }}>
      <svg width={86} height={36} viewBox="0 0 86 36" fill="none" style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 86,
        height: 36,
        borderRadius: 8,
      }}>
        <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 78 0 C 82.418 0 86 3.582 86 8 L 86 28 C 86 32.418 82.418 36 78 36 L 8 36 C 3.582 36 0 32.418 0 28 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
      <span style={{
        position: "absolute",
        left: 20,
        top: 7,
        width: 22,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Tag"}</span>
      <span style={{
        position: "absolute",
        left: 57,
        top: 10,
        width: 16,
        height: 16,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 16,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
      }}>{props.text2 ?? ""}</span>
    </div>
  );
}
export default TagsGreyEditable;
