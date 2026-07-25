// figma node: 12068:186 Buttons/Link Button/Active
export function ButtonsLinkButtonActive(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: "fit-content",
      display: "flex",
      flexDirection: "row",
      gap: 5,
      alignItems: "center",
      flexWrap: "nowrap",
      position: "relative",
      ...props.style,
    }}>
      <span style={{
        position: "relative",
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 18,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
        flexShrink: 0,
        alignSelf: "stretch",
      }}>{props.text1 ?? ""}</span>
      <span style={{
        position: "relative",
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 900,
        fontSize: 12,
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
        textTransform: "uppercase",
        flexShrink: 0,
      }}>{props.text2 ?? "Link"}</span>
    </div>
  );
}
export default ButtonsLinkButtonActive;
