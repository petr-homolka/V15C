// figma node: 12070:3451 Tables / Products / Grid 02 / Mobile
export function TablesProductsGrid02Mobile(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 348,
      height: 280,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 348,
        height: 280,
        borderRadius: 12,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 348,
        height: 192,
        borderRadius: "11px 11px 0px 0px",
      }} />
      <span style={{
        position: "absolute",
        left: 132,
        top: 237,
        width: 84,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "SKU 345-091"}</span>
      <span style={{
        position: "absolute",
        left: 93,
        top: 212,
        width: 162,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "Macbook Pro 15’ 2019"}</span>
      <div style={{
        position: "absolute",
        left: 240,
        top: 12,
        width: 94,
        height: 32,
      }}>
        <svg width={94} height={32} viewBox="0 0 94 32" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 94,
          height: 32,
          borderRadius: 8,
          color: "rgb(245,245,250)",
        }}>
          <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 86 0 C 90.418 0 94 3.582 94 8 L 94 24 C 94 28.418 90.418 32 86 32 L 8 32 C 3.582 32 0 28.418 0 24 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 12,
          top: 5,
          width: 70,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>Electronics</span>
      </div>
      <div style={{
        position: "absolute",
        left: 15,
        top: 12,
        width: 74,
        height: 32,
      }}>
        <svg width={74} height={32} viewBox="0 0 74 32" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 74,
          height: 32,
          borderRadius: 8,
          color: "rgb(245,245,250)",
        }}>
          <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 66 0 C 70.418 0 74 3.582 74 8 L 74 24 C 74 28.418 70.418 32 66 32 L 8 32 C 3.582 32 0 28.418 0 24 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 15,
          top: 5,
          width: 44,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>$2.700</span>
      </div>
    </div>
  );
}
export default TablesProductsGrid02Mobile;
