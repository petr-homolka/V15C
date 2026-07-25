// figma node: 12068:143 Progress Bars / Low
export function ProgressBarsLow(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 103,
      height: 6,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 103,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgb(245,245,250)",
      }} />
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 23,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgb(255,128,139)",
      }} />
    </div>
  );
}
export default ProgressBarsLow;
