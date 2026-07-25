// figma node: 12070:3500 Tables / Products / Row 02 / Mobile
export function TablesProductsRow02Mobile(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 348,
      height: 66,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 348,
        height: 66,
        borderRadius: 12,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <span style={{
        position: "absolute",
        left: 240,
        top: 12,
        width: 44,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "right",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "$2.700"}</span>
      <span style={{
        position: "absolute",
        left: 14,
        top: 35,
        width: 72,
        height: 18,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 12,
        whiteSpace: "nowrap",
        lineHeight: "18px",
        color: "rgb(129,129,165)",
      }}>{props.text2 ?? "SKU 345-091"}</span>
      <span style={{
        position: "absolute",
        left: 14,
        top: 12,
        width: 142,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text3 ?? "Macbook Pro 15’ 2019"}</span>
      <div style={{
        position: "absolute",
        left: 298,
        top: 14,
        width: 36,
        height: 36,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 36,
          height: 36,
          borderRadius: 8,
          backgroundColor: "rgb(255,255,255)",
          boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
        }} />
        <span style={{
          position: "absolute",
          left: 9,
          top: 9,
          width: 18,
          height: 18,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}></span>
      </div>
    </div>
  );
}
export default TablesProductsRow02Mobile;
