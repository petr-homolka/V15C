// figma node: 12070:2869 iOS Bars/Indicator/Light
export function IOSBarsIndicatorLight(_p = {}) {
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
        backgroundColor: "rgb(92,92,121)",
      }} />
    </div>
  );
}
export default IOSBarsIndicatorLight;
