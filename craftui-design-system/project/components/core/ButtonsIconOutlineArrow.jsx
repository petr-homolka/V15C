// figma node: 12068:249 Buttons / Icon / Outline / Arrow
export function ButtonsIconOutlineArrow(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 46,
      height: 46,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 46,
        height: 46,
        borderRadius: 8,
        backgroundColor: "rgb(255,255,255)",
        boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
      }} />
      <span style={{
        position: "absolute",
        left: 14,
        top: 14,
        width: 18,
        height: 18,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 18,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? ""}</span>
    </div>
  );
}
export default ButtonsIconOutlineArrow;
