// figma node: 12068:2614 Tables / Sales / List Widget
export function TablesSalesListWidget(_p = {}) {
  const props = _p;
  return (
    <div className={props.className} style={{
      width: 563,
      height: 730,
      position: "relative",
      ...props.style,
    }}>
      <div style={{
        position: "absolute",
        left: 28,
        top: 0,
        width: 507,
        height: 40,
      }}>
        <div style={{
          position: "absolute",
          left: 241,
          top: 0,
          display: "flex",
          flexDirection: "row",
          gap: 8,
          justifyContent: "flex-end",
          alignItems: "center",
          flexWrap: "nowrap",
        }}>
          <div style={{
            position: "relative",
            width: 62,
            height: 40,
            flexShrink: 0,
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
            position: "relative",
            width: 64,
            height: 40,
            flexShrink: 0,
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
            position: "relative",
            width: 76,
            height: 40,
            flexShrink: 0,
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
          <div style={{
            position: "relative",
            width: 40,
            height: 40,
            overflow: "hidden",
            flexShrink: 0,
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
            }}>{props.text1 ?? ""}</span>
          </div>
        </div>
        <span style={{
          position: "absolute",
          left: 0,
          top: 7,
          width: 65.57,
          height: 27,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 18,
          lineHeight: "27px",
          color: "rgb(28,29,33)",
        }}>{props.text2 ?? "Orders"}</span>
      </div>
      <span style={{
        position: "absolute",
        left: 170,
        top: 697,
        width: 137.12,
        height: 21,
        fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        lineHeight: "21px",
        color: "rgb(129,129,165)",
      }}>{props.text3 ?? "2.480 Total Orders"}</span>
      <div style={{
        position: "absolute",
        left: 29,
        top: 684,
        width: 124,
        height: 46,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 124,
          height: 46,
          borderRadius: 8,
          backgroundColor: "rgb(94,129,244)",
        }} />
        <span style={{
          position: "absolute",
          left: 29.49,
          top: 14,
          width: 65,
          height: 17,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 14,
          textAlign: "center",
          whiteSpace: "nowrap",
          lineHeight: "100%",
          color: "rgb(255,255,255)",
        }}>All Orders</span>
      </div>
      <div style={{
        position: "absolute",
        left: 29,
        top: 140,
        width: 510,
        height: 52,
      }}>
        <div style={{
          position: "absolute",
          left: 447,
          top: 4,
          width: 63,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 60.048,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "right",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>{props.text4 ?? "$118.00"}</span>
          <span style={{
            position: "absolute",
            left: 4.826,
            top: 22,
            width: 57.657,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            lineHeight: "21px",
            color: "rgb(124,231,172)",
          }}>Shipped</span>
        </div>
        <div style={{
          position: "absolute",
          left: 73,
          top: 4,
          width: 283.611,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 283.611,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Macbook Pro 2013, 16 GB, 256 GB SSD</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 223.66,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>4574 Bashirian Creek Suite 631</span>
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
        left: 29,
        top: 597,
        width: 510,
        height: 52,
      }}>
        <div style={{
          position: "absolute",
          left: 433,
          top: 4,
          width: 77,
          height: 42,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 13.088,
            top: 0,
            width: 59.918,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "right",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>$698.00</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 21,
            width: 76.876,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            lineHeight: "21px",
            color: "rgb(244,190,94)",
          }}>Processing</span>
        </div>
        <div style={{
          position: "absolute",
          left: 73,
          top: 4,
          width: 262.871,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 262.871,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Macbook Pro 2018, 32 GB, 1 TB SSD</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 199.459,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>9823 Crist Brooks Suite 116</span>
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
        left: 29,
        top: 368,
        width: 510,
        height: 52,
      }}>
        <div style={{
          position: "absolute",
          left: 446,
          top: 4,
          width: 64,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 59.918,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "right",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>$578.00</span>
          <span style={{
            position: "absolute",
            left: 6,
            top: 22,
            width: 57.657,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            lineHeight: "21px",
            color: "rgb(124,231,172)",
          }}>Shipped</span>
        </div>
        <div style={{
          position: "absolute",
          left: 73,
          top: 4,
          width: 214.447,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 200.612,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Macbook, 4GB, 128 GB SSD</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 214.447,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>1910 Erdman Station Apt. 696</span>
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
        left: 29,
        top: 216,
        width: 510,
        height: 52,
      }}>
        <div style={{
          position: "absolute",
          left: 433,
          top: 4,
          width: 77,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 13.219,
            top: 0,
            width: 59.918,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "right",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>$208.00</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 76.876,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            lineHeight: "21px",
            color: "rgb(244,190,94)",
          }}>Processing</span>
        </div>
        <div style={{
          position: "absolute",
          left: 73,
          top: 4,
          width: 269.788,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 269.788,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Dell XPS, 16 GB, 512 GB SSD, 1050 TI</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 171.788,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>8874 Candelario Valleys</span>
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
        left: 29,
        top: 445,
        width: 511,
        height: 52,
      }}>
        <div style={{
          position: "absolute",
          left: 440,
          top: 4,
          width: 71,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 5.436,
            top: 0,
            width: 59.918,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "right",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>$374.00</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 70.092,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            lineHeight: "21px",
            color: "rgb(255,128,139)",
          }}>Cancelled</span>
        </div>
        <div style={{
          position: "absolute",
          left: 73,
          top: 4,
          width: 228.282,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 208.682,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>LG Laptop, 8 GB, 256 GB SSD</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 228.282,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>586 Bernhard Landing Suite 706</span>
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
        left: 29,
        top: 292,
        width: 515,
        height: 52,
      }}>
        <div style={{
          position: "absolute",
          left: 433,
          top: 4,
          width: 82,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 21.219,
            top: 0,
            width: 59.918,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>$118.00</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 76.876,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            lineHeight: "21px",
            color: "rgb(244,190,94)",
          }}>Processing</span>
        </div>
        <div style={{
          position: "absolute",
          left: 73,
          top: 4,
          width: 267.482,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 267.482,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Macbook Air 2013, 4GB, 128 GB SSD</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 144.118,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>6124 Flossie Station</span>
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
        left: 28,
        top: 521,
        width: 512,
        height: 52,
      }}>
        <div style={{
          position: "absolute",
          left: 447.082,
          top: 4,
          width: 64,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 59.918,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "right",
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>$220.00</span>
          <span style={{
            position: "absolute",
            left: 5.918,
            top: 22,
            width: 57.657,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            lineHeight: "21px",
            color: "rgb(124,231,172)",
          }}>Shipped</span>
        </div>
        <div style={{
          position: "absolute",
          left: 69.606,
          top: 4,
          width: 283.624,
          height: 43,
          overflow: "hidden",
        }}>
          <span style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 283.624,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>Macbook Pro 2016, 16 GB, 512 GB SSD</span>
          <span style={{
            position: "absolute",
            left: 0,
            top: 22,
            width: 121.059,
            height: 21,
            fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
            fontWeight: 400,
            fontSize: 14,
            lineHeight: "21px",
            color: "rgb(28,29,33)",
          }}>201 Bosco Coves</span>
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
        left: 0,
        top: 66,
        width: 563,
        height: 48,
      }}>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 563,
          height: 48,
          backgroundColor: "rgb(245,245,250)",
        }} />
        <span style={{
          position: "absolute",
          left: 28,
          top: 15,
          width: 49.743,
          height: 18,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "18px",
          color: "rgb(129,129,165)",
        }}>Product</span>
        <span style={{
          position: "absolute",
          left: 495,
          top: 15,
          width: 44.09,
          height: 18,
          fontFamily: "Lato, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
          fontWeight: 700,
          fontSize: 12,
          lineHeight: "18px",
          color: "rgb(129,129,165)",
        }}>Details</span>
      </div>
    </div>
  );
}
export default TablesSalesListWidget;
