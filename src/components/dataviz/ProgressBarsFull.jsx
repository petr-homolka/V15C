// figma node: 12068:146 Progress Bars/Full
export function ProgressBarsFull(_p = {}) {
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
        backgroundColor: "rgb(124,231,172)",
      }} />
    </div>
  );
}
export default ProgressBarsFull;
