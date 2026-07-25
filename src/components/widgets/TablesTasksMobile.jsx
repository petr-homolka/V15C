// figma node: 12070:4004 Tables / Tasks / Mobile
export function TablesTasksMobile(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 348,
      height: 62,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 348,
        height: 62,
        borderRadius: 10,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 299,
        top: 14,
        width: 34,
        height: 34,
        borderRadius: 6,
      }} />
      <span style={{
        position: "absolute",
        left: 48,
        top: 20,
        width: 66,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(28,29,33)",
      }}>{props.text1 ?? "Task name"}</span>
      <div style={{
        position: "absolute",
        left: 16,
        top: 21,
        width: 20,
        height: 20,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 20,
          height: 20,
          borderRadius: 4,
          backgroundColor: "rgb(240,240,243)",
        }} />
        <span style={{
          position: "absolute",
          left: 32,
          top: -1,
          width: 0,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(129,129,165)",
        }}> </span>
      </div>
    </div>
  );
}
export default TablesTasksMobile;
