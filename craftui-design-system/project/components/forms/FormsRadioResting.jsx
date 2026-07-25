// figma node: 12068:28 Forms / Radio / Resting
export function FormsRadioResting(_p = {}) {
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
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Title"}</span>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 20,
        height: 20,
        borderRadius: 100,
        backgroundColor: "rgb(240,240,243)",
      }} />
    </div>
  );
}
export default FormsRadioResting;
