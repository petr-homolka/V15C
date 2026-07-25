// figma node: 12068:232 Buttons / Plain / Outline / ActiveButton
export function ButtonsPlainOutlineActiveButton(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 98,
      height: 46,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 98,
        height: 46,
        borderRadius: 8,
        backgroundColor: "rgb(255,255,255)",
        boxShadow: "inset 0 0 0 1px rgb(94,129,244)",
      }} />
      <span style={{
        position: "absolute",
        left: 32.5,
        top: 14,
        width: 34,
        height: 17,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(94,129,244)",
      }}>{props.text1 ?? "Lable"}</span>
    </div>
  );
}
export default ButtonsPlainOutlineActiveButton;
