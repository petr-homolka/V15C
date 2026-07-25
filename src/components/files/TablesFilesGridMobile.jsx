// figma node: 12070:3327 Tables / Files / Grid / Mobile
export function TablesFilesGridMobile(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 348,
      height: 248,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 348,
        height: 248,
        borderRadius: 10,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 16,
        top: 26,
        width: 73,
        height: 18,
      }}>
        <span style={{
          position: "absolute",
          left: 21,
          top: 0,
          width: 52,
          height: 18,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 12,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "18px",
          color: "rgb(129,129,165)",
        }}>{props.text1 ?? "Employee"}</span>
        <span style={{
          position: "absolute",
          left: 0,
          top: 2,
          width: 16,
          height: 16,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}>{props.text2 ?? ""}</span>
      </div>
      <span style={{
        position: "absolute",
        left: 142,
        top: 193,
        width: 65,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text3 ?? "Developer"}</span>
      <span style={{
        position: "absolute",
        left: 125,
        top: 169,
        width: 99,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>{props.text4 ?? "Ernest Mason"}</span>
      <div style={{
        position: "absolute",
        left: 138,
        top: 73,
        width: 71.647,
        height: 84,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 71.4,
          height: 84,
          borderRadius: 8,
          backgroundColor: "rgb(255,242,222)",
        }} />
        <svg width={10.128} height={8.366} viewBox="0 0 10.128 8.366" fill="none" style={{
          position: "absolute",
          left: 40.829,
          top: 27.3,
          width: 10.128,
          height: 8.366,
          color: "rgb(255,162,0)",
        }}>
          <path d={"M 10.128 8.366 L 0 8.366 L 1.762 0 L 10.128 8.366 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={10.120} height={8.366} viewBox="0 0 10.120 8.366" fill="none" style={{
          position: "absolute",
          left: 18.903,
          top: 27.3,
          width: 10.12,
          height: 8.366,
          color: "rgb(255,162,0)",
        }}>
          <path d={"M 10.12 8.366 L 0 8.366 L 8.358 0 L 10.12 8.366 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={15.330} height={8.366} viewBox="0 0 15.330 8.366" fill="none" style={{
          position: "absolute",
          left: 27.261,
          top: 27.3,
          width: 15.33,
          height: 8.366,
          color: "rgb(255,162,0)",
        }}>
          <path d={"M 15.33 0 L 13.568 8.366 L 1.762 8.366 L 0 0 L 15.33 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={32.054} height={21.037} viewBox="0 0 32.054 21.037" fill="none" style={{
          position: "absolute",
          left: 18.9,
          top: 35.663,
          width: 32.054,
          height: 21.037,
          color: "rgb(255,162,0)",
        }}>
          <path d={"M 32.054 0 L 16.027 21.037 L 0 0"} fill="currentColor" fillRule="nonzero" />
        </svg>
      </div>
      <div style={{
        position: "absolute",
        left: 294,
        top: 17,
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
export default TablesFilesGridMobile;
