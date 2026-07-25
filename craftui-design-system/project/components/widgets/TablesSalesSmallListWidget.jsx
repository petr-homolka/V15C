// figma node: 12068:2424 Tables / Sales / Small List Widget
export function TablesSalesSmallListWidget(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 1152,
      height: 375,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1152,
        height: 375,
        borderRadius: 10,
        backgroundColor: "rgb(255,255,255)",
        boxShadow: "0 0 0 1px rgb(240,240,243)",
      }} />
      <div style={{
        position: "absolute",
        left: 0,
        top: 80,
        width: 1152,
        height: 48,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1152,
          height: 48,
          backgroundColor: "rgba(245,245,250,0.4)",
        }} />
        <span style={{
          position: "absolute",
          left: 26,
          top: 14,
          width: 44,
          height: 18,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          whiteSpace: "nowrap",
          lineHeight: "18px",
          color: "rgb(129,129,165)",
        }}>{props.text1 ?? "Product"}</span>
        <span style={{
          position: "absolute",
          left: 254,
          top: 14,
          width: 53,
          height: 18,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          whiteSpace: "nowrap",
          lineHeight: "18px",
          color: "rgb(129,129,165)",
        }}>{props.text2 ?? "Customer"}</span>
        <span style={{
          position: "absolute",
          left: 482,
          top: 14,
          width: 46,
          height: 18,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          whiteSpace: "nowrap",
          lineHeight: "18px",
          color: "rgb(129,129,165)",
        }}>{props.text3 ?? "Delivery"}</span>
        <span style={{
          position: "absolute",
          left: 955,
          top: 14,
          width: 27,
          height: 18,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          whiteSpace: "nowrap",
          lineHeight: "18px",
          color: "rgb(129,129,165)",
        }}>{props.text4 ?? "Total"}</span>
        <span style={{
          position: "absolute",
          left: 828,
          top: 14,
          width: 47,
          height: 18,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          whiteSpace: "nowrap",
          lineHeight: "18px",
          color: "rgb(129,129,165)",
        }}>Shipping</span>
        <span style={{
          position: "absolute",
          left: 1092,
          top: 14,
          width: 35,
          height: 18,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          whiteSpace: "nowrap",
          lineHeight: "18px",
          color: "rgb(129,129,165)",
        }}>Status</span>
      </div>
      <div style={{
        position: "absolute",
        left: 862,
        top: 22,
        width: 266,
        height: 40,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 62,
          height: 40,
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 62,
            height: 40,
            borderRadius: 8,
            backgroundColor: "rgb(255,255,255)",
            boxShadow: "inset 0 0 0 1px rgb(236,236,242)",
          }} />
          <span style={{
            position: "absolute",
            left: 17.5,
            top: 10,
            width: 26,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Day</span>
        </div>
        <div style={{
          position: "absolute",
          left: 226,
          top: 0,
          width: 40,
          height: 40,
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 40,
            height: 40,
            opacity: 0.1,
            borderRadius: 6,
            backgroundColor: "rgb(129,129,165)",
          }} />
          <span style={{
            position: "absolute",
            left: 11,
            top: 11,
            width: 18,
            height: 18,
            fontFamily: "\"la-solid-900\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 18,
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: "100%",
            color: "rgb(129,129,165)",
          }}></span>
        </div>
        <div style={{
          position: "absolute",
          left: 70,
          top: 0,
          width: 64,
          height: 40,
        }}>
          <span style={{
            position: "absolute",
            left: 12.432,
            top: 10,
            width: 38,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(129,129,165)",
          }}>Week</span>
        </div>
        <div style={{
          position: "absolute",
          left: 142,
          top: 0,
          width: 76,
          height: 40,
        }}>
          <span style={{
            position: "absolute",
            left: 16.514,
            top: 10,
            width: 43,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(129,129,165)",
          }}>Month</span>
        </div>
      </div>
      <span style={{
        position: "absolute",
        left: 24,
        top: 29,
        width: 94,
        height: 27,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 700,
        fontSize: 18,
        whiteSpace: "nowrap",
        lineHeight: "27px",
        color: "rgb(28,29,33)",
      }}>Latest sales</span>
      <div style={{
        position: "absolute",
        left: 25.162,
        top: 146.789,
        width: 1103,
        height: 52,
        overflow: "hidden",
      }}>
        <span style={{
          position: "absolute",
          left: 904.777,
          top: 16,
          width: 52,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$118.00</span>
        <span style={{
          position: "absolute",
          left: 805.277,
          top: 16,
          width: 44,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$18.00</span>
        <div style={{
          position: "absolute",
          left: 996.681,
          top: 8,
          width: 106,
          height: 36,
        }}>
          <svg width={106} height={36} viewBox="0 0 106 36" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 106,
            height: 36,
            borderRadius: 8,
          }}>
            <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 98 0 C 102.418 0 106 3.582 106 8 L 106 28 C 106 32.418 102.418 36 98 36 L 8 36 C 3.582 36 0 32.418 0 28 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <span style={{
            position: "absolute",
            left: 28,
            top: 7,
            width: 51,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(124,231,172)",
          }}>Shipped</span>
        </div>
        <div style={{
          position: "absolute",
          left: 457,
          top: 4,
          width: 211,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 103,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>United Kingdom</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 211,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>193 Cole Plains Suite 649, 891203</span>
        </div>
        <div style={{
          position: "absolute",
          left: 230,
          top: 4,
          width: 164,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 100,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Rodney Cannon</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 164,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>rodney.cannon@gmail.com</span>
        </div>
        <div style={{
          position: "absolute",
          left: 73,
          top: 4,
          width: 93,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 84,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Macbook Pro</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 93,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>ID 10-3290-08</span>
        </div>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 52,
          height: 52,
          borderRadius: 8,
        }} />
      </div>
      <div style={{
        position: "absolute",
        left: 25.162,
        top: 221.789,
        width: 1103,
        height: 52,
        overflow: "hidden",
      }}>
        <span style={{
          position: "absolute",
          left: 904.777,
          top: 16,
          width: 52,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$208.00</span>
        <span style={{
          position: "absolute",
          left: 805.277,
          top: 16,
          width: 44,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$28.00</span>
        <div style={{
          position: "absolute",
          left: 996.681,
          top: 8,
          width: 106,
          height: 36,
        }}>
          <svg width={106} height={36} viewBox="0 0 106 36" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 106,
            height: 36,
            borderRadius: 8,
          }}>
            <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 98 0 C 102.418 0 106 3.582 106 8 L 106 28 C 106 32.418 102.418 36 98 36 L 8 36 C 3.582 36 0 32.418 0 28 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <span style={{
            position: "absolute",
            left: 19,
            top: 7,
            width: 68,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(244,190,94)",
          }}>Processing</span>
        </div>
        <div style={{
          position: "absolute",
          left: 457,
          top: 4,
          width: 181,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 85,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>United States</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 181,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>619 Jeffrey Freeway Apt. 273</span>
        </div>
        <div style={{
          position: "absolute",
          left: 230,
          top: 4,
          width: 153,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 86,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Mike Franklin</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 153,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>mike.franklin@gmail.com</span>
        </div>
        <div style={{
          position: "absolute",
          left: 73,
          top: 4,
          width: 93,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 73,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Dell Laptop</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 93,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>ID 10-3456-18</span>
        </div>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 52,
          height: 52,
          borderRadius: 8,
        }} />
      </div>
      <div style={{
        position: "absolute",
        left: 25.162,
        top: 295.732,
        width: 1103,
        height: 52,
        overflow: "hidden",
      }}>
        <span style={{
          position: "absolute",
          left: 904.777,
          top: 16,
          width: 52,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$118.00</span>
        <span style={{
          position: "absolute",
          left: 805.277,
          top: 16,
          width: 44,
          height: 21,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          whiteSpace: "nowrap",
          lineHeight: "21px",
          color: "rgb(28,29,33)",
        }}>$18.00</span>
        <div style={{
          position: "absolute",
          left: 996.681,
          top: 8,
          width: 106,
          height: 36,
        }}>
          <svg width={106} height={36} viewBox="0 0 106 36" fill="none" style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 106,
            height: 36,
            borderRadius: 8,
          }}>
            <path d={"M 0 8 C 0 3.582 3.582 0 8 0 L 98 0 C 102.418 0 106 3.582 106 8 L 106 28 C 106 32.418 102.418 36 98 36 L 8 36 C 3.582 36 0 32.418 0 28 L 0 8 Z"} fill="currentColor" fillRule="nonzero" />
          </svg>
          <span style={{
            position: "absolute",
            left: 19,
            top: 7,
            width: 68,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(244,190,94)",
          }}>Processing</span>
        </div>
        <div style={{
          position: "absolute",
          left: 457,
          top: 4,
          width: 171,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 58,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Germany</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 171,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>200 Davis Estates Suite 621</span>
        </div>
        <div style={{
          position: "absolute",
          left: 230,
          top: 4,
          width: 153,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 88,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Louis Franklin</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 153,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>louis.franklin@gmail.com</span>
        </div>
        <div style={{
          position: "absolute",
          left: 73,
          top: 4,
          width: 93,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 81,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Macbook Air</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 93,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            whiteSpace: "nowrap",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>ID 10-3786-23</span>
        </div>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 52,
          height: 52,
          borderRadius: 8,
        }} />
      </div>
    </div>
  );
}
export default TablesSalesSmallListWidget;
