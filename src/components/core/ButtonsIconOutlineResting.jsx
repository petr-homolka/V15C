// figma node: 12068:245 Buttons / Icon / Outline / Resting
export function ButtonsIconOutlineResting(_p = {}) {
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
        boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
      }} />
      <span style={{
        position: "absolute",
        left: 45,
        top: 14,
        width: 34,
        height: 17,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "Lable"}</span>
      <span style={{
        position: "absolute",
        left: 19,
        top: 13,
        width: 18,
        height: 18,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 18,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
      }}>{props.text2 ?? ""}</span>
    </div>
  );
}
export default ButtonsIconOutlineResting;
