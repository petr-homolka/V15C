// figma node: 12070:3345 Tables / Files / List / Mobile
export function TablesFilesListMobile(_p = {}) {
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
        left: 75,
        top: 24,
        width: 99,
        height: 24,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        whiteSpace: "nowrap",
        lineHeight: "24px",
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "Ernest Mason"}</span>
      <div style={{
        position: "absolute",
        left: 16,
        top: 12,
        width: 42.647,
        height: 50,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 42.5,
          height: 50,
          borderRadius: 8,
          backgroundColor: "rgb(255,242,222)",
        }} />
        <svg width={6.029} height={4.980} viewBox="0 0 6.029 4.980" fill="none" style={{
          position: "absolute",
          left: 24.303,
          top: 16.25,
          width: 6.029,
          height: 4.98,
          color: "rgb(255,162,0)",
        }}>
          <path d={"M 6.029 4.98 L 0 4.98 L 1.049 0 L 6.029 4.98 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={6.024} height={4.980} viewBox="0 0 6.024 4.980" fill="none" style={{
          position: "absolute",
          left: 11.252,
          top: 16.25,
          width: 6.024,
          height: 4.98,
          color: "rgb(255,162,0)",
        }}>
          <path d={"M 6.024 4.98 L 0 4.98 L 4.975 0 L 6.024 4.98 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={9.125} height={4.980} viewBox="0 0 9.125 4.980" fill="none" style={{
          position: "absolute",
          left: 16.227,
          top: 16.25,
          width: 9.125,
          height: 4.98,
          color: "rgb(255,162,0)",
        }}>
          <path d={"M 9.125 0 L 8.076 4.98 L 1.049 4.98 L 0 0 L 9.125 0 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={19.080} height={12.522} viewBox="0 0 19.080 12.522" fill="none" style={{
          position: "absolute",
          left: 11.25,
          top: 21.228,
          width: 19.08,
          height: 12.522,
          color: "rgb(255,162,0)",
        }}>
          <path d={"M 19.08 0 L 9.54 12.522 L 0 0"} fill="currentColor" fillRule="nonzero" />
        </svg>
      </div>
      <div style={{
        position: "absolute",
        left: 295,
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
export default TablesFilesListMobile;
