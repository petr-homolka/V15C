// figma node: 12068:2769 Counters / Graph / Web
export function CountersGraphWeb(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 360,
      height: 98,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 360,
        height: 98,
        borderRadius: 10,
        backgroundColor: "rgb(255,255,255)",
      }} />
      <div style={{
        position: "absolute",
        left: 161.375,
        top: 18,
        width: 178,
        height: 48,
      }}>
        <svg width={178.000} height={40.320} viewBox="0 0 178.000 40.320" fill="none" style={{
          position: "absolute",
          left: 0,
          top: 7.423,
          width: 178,
          height: 40.32,
          color: "rgb(94,129,244)",
        }}>
          <path d={"M 0.283 30.29 C 8.039 38.267 14.746 41.542 20.442 39.913 C 23.692 38.984 26.063 36.944 30.748 31.831 C 31.761 30.726 31.758 30.728 32.12 30.339 C 36.255 25.882 38.788 24.046 41.558 24.046 C 43.031 24.046 44.2 24.138 46.825 24.417 L 46.915 24.427 C 55.611 25.351 59.961 24.651 66.289 19.737 C 68.214 18.242 69.921 16.575 71.673 14.557 C 72.782 13.28 76.225 8.954 76.103 9.103 C 80.158 4.157 83.193 2.241 88.424 2.241 C 90.563 2.241 92.622 3.177 95.256 5.17 C 95.833 5.607 96.436 6.091 97.185 6.712 C 97.57 7.032 98.936 8.181 99.185 8.388 C 104.105 12.493 107.361 14.385 111.695 14.892 C 117.327 15.551 123.57 13.202 130.981 7.2 C 146.473 -5.347 161.397 5.06 176.081 39.346 C 176.298 39.853 176.886 40.089 177.394 39.871 C 177.901 39.654 178.137 39.066 177.919 38.558 C 162.793 3.24 146.618 -8.039 129.722 5.645 C 122.696 11.336 116.96 13.494 111.927 12.906 C 108.087 12.456 105.108 10.725 100.466 6.852 C 100.222 6.649 98.854 5.498 98.463 5.174 C 97.693 4.534 97.068 4.033 96.463 3.575 C 93.514 1.344 91.088 0.241 88.424 0.241 C 82.486 0.241 78.954 2.471 74.557 7.835 C 74.654 7.715 71.239 12.007 70.163 13.245 C 68.49 15.172 66.875 16.75 65.062 18.157 C 59.225 22.691 55.357 23.313 47.126 22.438 L 47.036 22.429 C 44.342 22.142 43.125 22.046 41.558 22.046 C 38.021 22.046 35.167 24.115 30.653 28.979 C 30.443 29.206 30.223 29.444 29.962 29.728 C 29.796 29.91 29.618 30.104 29.274 30.48 C 24.857 35.3 22.644 37.204 19.892 37.99 C 15.085 39.365 9.013 36.4 1.717 28.896 C 1.332 28.5 0.699 28.491 0.303 28.876 C -0.093 29.261 -0.102 29.894 0.283 30.29 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{
          position: "absolute",
          left: 80,
          top: 0,
          width: 14,
          height: 14,
          color: "rgb(255,255,255)",
        }}>
          <path d={"M 7 14 C 10.866 14 14 10.866 14 7 C 14 3.134 10.866 0 7 0 C 3.134 0 0 3.134 0 7 C 0 10.866 3.134 14 7 14 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
        <svg width={8} height={8} viewBox="0 0 8 8" fill="none" style={{
          position: "absolute",
          left: 83,
          top: 3,
          width: 8,
          height: 8,
          color: "rgb(94,129,244)",
        }}>
          <path d={"M 4 8 C 6.209 8 8 6.209 8 4 C 8 1.791 6.209 0 4 0 C 1.791 0 0 1.791 0 4 C 0 6.209 1.791 8 4 8 Z"} fill="currentColor" fillRule="nonzero" />
        </svg>
      </div>
      <span style={{
        position: "absolute",
        left: 28,
        top: 54,
        width: 64,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        whiteSpace: "nowrap",
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text1 ?? "New tasks"}</span>
      <div style={{
        position: "absolute",
        left: 28,
        top: 22,
        width: 35,
        height: 32,
        overflow: "hidden",
      }}>
        <span style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 35,
          height: 32,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 20,
          whiteSpace: "nowrap",
          lineHeight: "32px",
          color: "rgb(28,29,33)",
        }}>{props.text2 ?? "345"}</span>
      </div>
    </div>
  );
}
export default CountersGraphWeb;
