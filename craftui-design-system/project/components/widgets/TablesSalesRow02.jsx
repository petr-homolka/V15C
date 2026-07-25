// figma node: 12070:3939 Tables / Sales / Row 02
export function TablesSalesRow02(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 558,
      height: 52,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 403,
        top: 11,
        width: 84,
        height: 30,
      }}>
        <svg width={84} height={30} viewBox="0 0 84 30" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 84,
          height: 30,
          borderRadius: 8,
        }}>
          <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 76 0 C 80.418 0 84 3.582 84 8 L 84 22 C 84 26.418 80.418 30 76 30 L 8 30 C 3.582 30 0 26.418 0 22 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <span style={{
          position: "absolute",
          left: 28,
          top: 4,
          width: 28,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(94,129,244)",
        }}>Paid</span>
      </div>
      <span style={{
        position: "absolute",
        left: 32,
        top: 15,
        width: 179,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "lubowitz_johann@yahoo.com"}</span>
      <span style={{
        position: "absolute",
        left: 315,
        top: 15.081,
        width: 60,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "right",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "$2400.00"}</span>
      <div style={{
        position: "absolute",
        left: 495,
        top: 11,
        width: 30,
        height: 30,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: "rgb(255,255,255)",
          boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
        }} />
        <span style={{
          position: "absolute",
          left: 6,
          top: 6,
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
export default TablesSalesRow02;
