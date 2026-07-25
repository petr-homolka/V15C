// figma node: 12068:84 Forms / Input / Disabled
export function FormsInputDisabled(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 360,
      height: 72,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 71,
        width: 360,
        height: 1,
        backgroundColor: "rgb(236,236,242)",
      }} />
      <span style={{
        position: "absolute",
        left: 0,
        top: 36,
        width: 85,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Start typing…"}</span>
      <span style={{
        position: "absolute",
        left: 342,
        top: 36,
        width: 18,
        height: 18,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 18,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
      }}>{props.text2 ?? ""}</span>
      <span style={{
        position: "absolute",
        left: 0,
        top: 10,
        width: 58,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text3 ?? "Field title"}</span>
    </div>
  );
}
export default FormsInputDisabled;
