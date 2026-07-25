// figma node: 12068:237 Buttons / Plain / Primary / Active
export function ButtonsPlainPrimaryActive(_p = {}) {
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
        backgroundColor: "rgb(94,129,244)",
      }} />
      <span style={{
        position: "absolute",
        left: 32,
        top: 14,
        width: 34,
        height: 17,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(255,255,255)",
      }}>{props.text1 ?? "Lable"}</span>
    </div>
  );
}
export default ButtonsPlainPrimaryActive;
