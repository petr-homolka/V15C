// figma node: 12070:3470 Tables / Products / Row 01 / Mobile
export function TablesProductsRow01Mobile(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 348,
      height: 74,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 348,
        height: 74,
        borderRadius: 12,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <span style={{
        position: "absolute",
        left: 81,
        top: 37,
        width: 84,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "SKU 345-091"}</span>
      <span style={{
        position: "absolute",
        left: 81,
        top: 15,
        width: 162,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "Macbook Pro 15’ 2019"}</span>
      <div style={{
        position: "absolute",
        left: 14,
        top: 11,
        width: 52,
        height: 52,
        overflow: "hidden",
      }}>
        <svg width={52} height={52} viewBox="0 0 52 52" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 52,
          height: 52,
          borderRadius: 6,
        }}>
          <path d={"M 0 52 L 52 52 L 52 0 L 0 0 L 0 52 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
      </div>
      <div style={{
        position: "absolute",
        left: 298,
        top: 19,
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
export default TablesProductsRow01Mobile;
