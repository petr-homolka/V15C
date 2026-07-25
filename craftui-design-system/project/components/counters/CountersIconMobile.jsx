// figma node: 12070:2179 Counters / Icon / Mobile
export function CountersIconMobile(_p = {}) {
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
        borderRadius: 10,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 34,
        top: 20,
        width: 56,
        height: 56,
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
        }}>{props.text1 ?? ""}</span>
      </div>
      <span style={{
        position: "absolute",
        left: 97,
        top: 10,
        width: 16,
        height: 16,
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 16,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(94,129,244)",
      }}>{props.text2 ?? ""}</span>
      <span style={{
        position: "absolute",
        left: 39.5,
        top: 86,
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
      <span style={{
        position: "absolute",
        left: 31,
        top: 110,
        width: 62,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text4 ?? "New sales"}</span>
    </div>
  );
}
export default CountersIconMobile;
