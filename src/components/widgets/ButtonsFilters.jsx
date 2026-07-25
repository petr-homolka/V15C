// figma node: 12070:2059 Buttons / Filters
export function ButtonsFilters(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: "fit-content",
      display: "flex",
      flexDirection: "row",
      gap: 6,
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
      }}>{props.text1 ?? ""}</span>
      <span style={{
        position: "relative",
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 12,
        whiteSpace: "nowrap",
        lineHeight: "18px",
        color: "rgb(129,129,165)",
        flexShrink: 0,
        alignSelf: "stretch",
      }}>{props.text2 ?? "SORT:"}</span>
      <span style={{
        position: "relative",
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 900,
        fontSize: 12,
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(28,29,33)",
        textTransform: "uppercase",
        flexShrink: 0,
      }}>{props.text3 ?? "a-z"}</span>
      <span style={{
        position: "relative",
        fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 16,
        textAlign: "center",
        whiteSpace: "nowrap",
        lineHeight: "100%",
        color: "rgb(129,129,165)",
        flexShrink: 0,
        alignSelf: "stretch",
      }}>{props.text4 ?? ""}</span>
    </div>
  );
}
export default ButtonsFilters;
