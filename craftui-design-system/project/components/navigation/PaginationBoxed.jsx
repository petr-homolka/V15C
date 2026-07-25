// figma node: 12068:169 Pagination/Boxed
export function PaginationBoxed(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 360,
      height: 40,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 112,
        top: 0,
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: "rgb(255,255,255)",
        boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
      }} />
      <div style={{
        position: "absolute",
        left: 64,
        top: 0,
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 160,
        top: 0,
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 208,
        top: 0,
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 256,
        top: 0,
        width: 40,
        height: 40,
        borderRadius: 6,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <span style={{
        position: "absolute",
        left: 64,
        top: 9,
        width: 40,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "1"}</span>
      <span style={{
        position: "absolute",
        left: 127.833,
        top: 9,
        width: 9,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text2 ?? "2"}</span>
      <span style={{
        position: "absolute",
        left: 160,
        top: 9,
        width: 40,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text3 ?? "3"}</span>
      <span style={{
        position: "absolute",
        left: 208,
        top: 9,
        width: 40,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text4 ?? "4"}</span>
      <span style={{
        position: "absolute",
        left: 256,
        top: 9,
        width: 40,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        textAlign: "center",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>5</span>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 40,
        height: 40,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 40,
          height: 40,
          borderRadius: 6,
          backgroundColor: "rgb(245,245,250)",
        }} />
        <span style={{
          position: "absolute",
          left: 11,
          top: 10,
          width: 18,
          height: 18,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          textAlign: "center",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}></span>
      </div>
      <div style={{
        position: "absolute",
        left: 320,
        top: 0,
        width: 40,
        height: 40,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 40,
          height: 40,
          borderRadius: 6,
          backgroundColor: "rgb(245,245,250)",
        }} />
        <span style={{
          position: "absolute",
          left: 11,
          top: 11,
          width: 18,
          height: 18,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 18,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}></span>
      </div>
    </div>
  );
}
export default PaginationBoxed;
