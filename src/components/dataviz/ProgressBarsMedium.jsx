// figma node: 12068:140 Progress Bars / Medium
export function ProgressBarsMedium(_p = {}) {
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
        width: 61,
        height: 6,
        borderRadius: 3,
        backgroundColor: "rgb(244,190,94)",
      }} />
    </div>
  );
}
export default ProgressBarsMedium;
