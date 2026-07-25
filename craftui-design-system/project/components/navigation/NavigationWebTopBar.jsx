// figma node: 12068:2164 Navigation Web / Top Bar
export function NavigationWebTopBar(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 1198,
      height: 84,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 28,
        top: 24,
        width: 36,
        height: 36,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 36,
          height: 36,
          borderRadius: 6,
          backgroundColor: "rgb(240,240,243)",
        }} />
        <span style={{
          position: "absolute",
          left: 10,
          top: 10,
          width: 16,
          height: 16,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}>{props.text1 ?? ""}</span>
      </div>
      <div style={{
        position: "absolute",
        left: 1134,
        top: 24,
        width: 36,
        height: 36,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 36,
          height: 36,
          borderRadius: 6,
          backgroundColor: "rgb(240,240,243)",
        }} />
        <span style={{
          position: "absolute",
          left: 10,
          top: 10,
          width: 16,
          height: 16,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}>{props.text2 ?? ""}</span>
      </div>
      <div style={{
        position: "absolute",
        left: 1092,
        top: 24,
        width: 36,
        height: 36,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 36,
          height: 36,
          borderRadius: 6,
          backgroundColor: "rgb(240,240,243)",
        }} />
        <span style={{
          position: "absolute",
          left: 10,
          top: 10,
          width: 16,
          height: 16,
          fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 400,
          fontSize: 16,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(129,129,165)",
        }}>{props.text3 ?? ""}</span>
      </div>
      <span style={{
        position: "absolute",
        left: 84,
        top: 25,
        width: 85,
        height: 32,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 20,
        whiteSpace: "nowrap",
        lineHeight: "32px",
        color: "rgb(28,29,33)",
      }}>{props.text4 ?? "Page title"}</span>
    </div>
  );
}
export default NavigationWebTopBar;
