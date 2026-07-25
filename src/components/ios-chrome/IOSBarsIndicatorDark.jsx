// figma node: 12070:2865 iOS Bars/Indicator/Dark
export function IOSBarsIndicatorDark(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 134,
      height: 12,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 134,
        height: 12,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 134,
          height: 12,
          opacity: 0,
          backgroundColor: "rgb(216,216,216)",
        }} />
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 134,
          height: 5,
          borderRadius: 100,
          backgroundColor: "rgb(255,255,255)",
        }} />
      </div>
    </div>
  );
}
export default IOSBarsIndicatorDark;
