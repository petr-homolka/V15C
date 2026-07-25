// figma node: 12068:51 Forms / Checkbox / Error
export function FormsCheckboxError(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 66,
      height: 20,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 20,
        height: 20,
        borderRadius: 4,
        background: "linear-gradient(rgba(255,128,139,0.1),rgba(255,128,139,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
      }} />
      <span style={{
        position: "absolute",
        left: 32,
        top: -1,
        width: 29,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(255,128,139)",
      }}>{props.text1 ?? "Title"}</span>
    </div>
  );
}
export default FormsCheckboxError;
