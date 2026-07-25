// figma node: 12070:2994 Navigation Mobile / Top Bar
export function NavigationMobileTopBar(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 375,
      height: 70,
      position: "relative",
      color: "rgb(236,236,242)",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 323,
        top: 15,
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
          opacity: 0.1,
          borderRadius: 6,
          backgroundColor: "rgb(129,129,165)",
        }} />
        <span style={{
          position: "absolute",
          left: 10,
          top: 12,
          width: 18.462,
          height: 16,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          textAlign: "center",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}>{props.text1 ?? ""}</span>
      </div>
      <div style={{
        position: "absolute",
        left: 14,
        top: 15,
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
          opacity: 0.1,
          borderRadius: 6,
          backgroundColor: "rgb(129,129,165)",
        }} />
        <span style={{
          position: "absolute",
          left: 10,
          top: 12,
          width: 18.462,
          height: 16,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          textAlign: "center",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}>{props.text2 ?? ""}</span>
      </div>
      <span style={{
        position: "absolute",
        left: 149.5,
        top: 23,
        width: 76,
        height: 27,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 18,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "27px",
        color: "rgb(28,29,33)",
      }}>{props.text3 ?? "Page title"}</span>
      <svg width={376} height={1} viewBox="0 0 376 1" fill="none" style={{
        position: "absolute",
        left: 0,
        top: 69,
        width: 376,
        height: 1,
      }}>
        <path d={"M 0.5 0 L 0 0 L 0 1 L 0.5 1 L 0.5 0.5 L 0.5 0 Z M 375.5 1 L 376 1 L 376 0 L 375.5 0 L 375.5 0.5 L 375.5 1 Z M 0.5 0.5 L 0.5 1 L 375.5 1 L 375.5 0.5 L 375.5 0 L 0.5 0 L 0.5 0.5 Z"} fill="currentColor" fillRule="nonzero" />
      </svg>
    </div>
  );
}
export default NavigationMobileTopBar;
