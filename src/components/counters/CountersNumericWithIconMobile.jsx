// figma node: 12070:2195 Counters / Numeric with Icon / Mobile
export function CountersNumericWithIconMobile(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 124,
      height: 150,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 124,
        height: 150,
        borderRadius: 12,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 34,
        top: 20,
        width: 56,
        height: 56,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 56,
          height: 56,
          borderRadius: 10,
          background: "linear-gradient(rgba(94,129,244,0.1),rgba(94,129,244,0.1)), linear-gradient(rgb(255,255,255),rgb(255,255,255))",
        }} />
        <span style={{
          position: "absolute",
          left: 17,
          top: 16,
          width: 22,
          height: 22,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 22,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(94,129,244)",
        }}>{props.text1 ?? ""}</span>
      </div>
      <span style={{
        position: "absolute",
        left: 29,
        top: 112,
        width: 67,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text2 ?? "Employees"}</span>
      <span style={{
        position: "absolute",
        left: 39,
        top: 88,
        width: 46,
        height: 27,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 18,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "27px",
        color: "rgb(28,29,33)",
      }}>{props.text3 ?? "1.345"}</span>
    </div>
  );
}
export default CountersNumericWithIconMobile;
