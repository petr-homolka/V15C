// figma node: 12068:153 Pagination/Primary
export function PaginationPrimary(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 483,
      height: 40,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 134,
        top: 4,
        width: 215,
        height: 32,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 47.833,
          top: 0,
          width: 32,
          height: 32,
          borderRadius: 6,
          backgroundColor: "rgb(94,129,244)",
        }} />
        <span style={{
          position: "absolute",
          left: 0,
          top: 5,
          width: 40,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>{props.text1 ?? "1"}</span>
        <span style={{
          position: "absolute",
          left: 59.167,
          top: 5,
          width: 9,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          lineHeight: "21px",
          color: "rgb(255,255,255)",
        }}>{props.text2 ?? "2"}</span>
        <span style={{
          position: "absolute",
          left: 87.333,
          top: 5,
          width: 40,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>{props.text3 ?? "3"}</span>
        <span style={{
          position: "absolute",
          left: 131,
          top: 5,
          width: 40,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>{props.text4 ?? "4"}</span>
        <span style={{
          position: "absolute",
          left: 174.667,
          top: 5,
          width: 40,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>5</span>
      </div>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 79,
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
        <span style={{
          position: "absolute",
          left: 50,
          top: 9,
          width: 29,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>Prev</span>
      </div>
      <div style={{
        position: "absolute",
        left: 403,
        top: 0,
        width: 80,
        height: 40,
      }}>
        <div style={{
          position: "absolute",
          left: 40,
          top: 0,
          width: 40,
          height: 40,
          borderRadius: 6,
          backgroundColor: "rgb(245,245,250)",
        }} />
        <span style={{
          position: "absolute",
          left: 51,
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
        <span style={{
          position: "absolute",
          left: 0,
          top: 9,
          width: 30,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 14,
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}>Next</span>
      </div>
    </div>
  );
}
export default PaginationPrimary;
