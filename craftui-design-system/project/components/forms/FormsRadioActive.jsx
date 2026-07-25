// figma node: 12068:31 Forms / Radio / Active
export function FormsRadioActive(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 66,
      height: 20,
      position: "relative",
      ...props.style,
    }}>
      <span style={{
        position: "absolute",
        left: 30,
        top: -1,
        width: 29,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "Title"}</span>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "rgb(94,129,244)",
      }} />
      <div style={{
        position: "absolute",
        left: 6,
        top: 6,
        width: 8,
        height: 8,
        borderRadius: 10,
        backgroundColor: "rgb(255,255,255)",
      }} />
    </div>
  );
}
export default FormsRadioActive;
