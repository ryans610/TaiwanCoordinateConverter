# TaiwanCoordinateConverter

A dependency-free JavaScript library for converting between the four coordinate systems commonly used in Taiwan, and for measuring the distance between two points.

| System | Description |
| --- | --- |
| **TPC** (台電座標) | Taipower grid code, e.g. `R1998EE79` |
| **TWD67 / T67** | Taiwan Datum 1967, TM2 projection (meters) |
| **TWD97 / T97** | Taiwan Datum 1997, TM2 projection (meters) |
| **WGS84** | Latitude / longitude (degrees) |

```
TPC  ⇄  TWD67  ⇄  TWD97  ⇄  WGS84
```

Every pair is supported. Indirect conversions (e.g. TPC → WGS84) are chained through the intermediate systems.

## Files

| File | Purpose |
| --- | --- |
| `TPCCoordinate.js` | The library. Exposes a single global, `TPCCConvert`. |
| `TPCCoordinate.html` | Demo page (Traditional Chinese UI) for each conversion and both distance calculators. |
| `TriangulationPoints.xlsx` | Reference control points (Taiwan, Penghu, Kinmen, Matsu) with WGS84, TWD97 and TWD67 coordinates. Useful for checking accuracy. |

## Getting started

No build step and no dependencies. Include the script:

```html
<script src="TPCCoordinate.js"></script>
<script>
  var t67 = TPCCConvert.TPCToT67("R1998EE79");
  console.log(t67); // { x: 265670, y: 2549490 }
</script>
```

To try the demo, open `TPCCoordinate.html` in a browser.

### Node.js

The file has no `module.exports`. To use it in Node, either add one line at the end of the file:

```js
module.exports = TPCCConvert;
```

or load it as is:

```js
const fs = require("fs");
const vm = require("vm");
const ctx = {};
vm.runInNewContext(fs.readFileSync("TPCCoordinate.js", "utf8") + ";this.TPCCConvert=TPCCConvert;", ctx);
const TPCCConvert = ctx.TPCCConvert;
```

## API

All functions are on the `TPCCConvert` object.

### Data formats

| Type | Shape | Example |
| --- | --- | --- |
| TPC | `string` | `"R1998EE79"` |
| T67 / T97 | `{ x, y }` | `{ x: 265670, y: 2549490 }` |
| WGS84 | `{ lat, lng }` | `{ lat: 25.01774, lng: 121.531041 }` |

Numeric fields may be numbers or numeric strings. Spaces in strings are removed, so values can be passed straight from `<input>` elements. Input objects are not changed.

### Conversion

| Function | Input → Output |
| --- | --- |
| `TPCToT67(tpc)` | TPC → T67 |
| `T67ToTPC(t67)` | T67 → TPC |
| `T67ToT97(t67)` | T67 → T97 |
| `T97ToT67(t97)` | T97 → T67 |
| `T97ToWGS84(t97)` | T97 → WGS84 |
| `WGS84ToT97(wgs84)` | WGS84 → T97 |
| `TPCToT97(tpc)` | TPC → T97 |
| `T97ToTPC(t97)` | T97 → TPC |
| `T67ToWGS84(t67)` | T67 → WGS84 |
| `WGS84ToT67(wgs84)` | WGS84 → T67 |
| `TPCToWGS84(tpc)` | TPC → WGS84 |
| `WGS84ToTPC(wgs84)` | WGS84 → TPC |

### Distance

All return meters, using the haversine formula on a sphere of radius 6,378,137 m.

| Function | Inputs |
| --- | --- |
| `WGS84Distance(p1, p2)` | two WGS84 points |
| `TPCDistance(p1, p2)` | two TPC codes |
| `T67Distance(p1, p2)` | two T67 points |
| `T97Distance(p1, p2)` | two T97 points |

### Examples

```js
TPCCConvert.TPCToT67("R1998EE79");
// { x: 265670, y: 2549490 }

TPCCConvert.T67ToTPC({ x: 265670, y: 2549490 });
// "R1998EE7900"

TPCCConvert.T67ToT97({ x: 265670, y: 2549490 });
// { x: 266498.54045259, y: 2549282.62403417 }

TPCCConvert.T97ToWGS84({ x: 266498.54045259, y: 2549282.62403417 });
// { lat: 23.045067089807194, lng: 121.16099543351804 }

TPCCConvert.WGS84Distance(
  { lat: 25.01774,  lng: 121.531041 },
  { lat: 25.020729, lng: 121.528174 }
);
// 440.85340896086643

TPCCConvert.TPCDistance("B6536HA6551", "B6536ED7841");
// 441.1274970000658
```

## TPC code format

A TPC code refines a TWD67 position step by step. It can be 5, 7, 9 or 11 characters long. Longer codes are more precise.

```
R  19  98  EE  79  00
│   │   │   │   │   └ 1 m:   x digit, y digit
│   │   │   │   └──── 10 m:  x digit, y digit
│   │   │   └──────── 100 m: x letter, y letter (A = 0, B = 1, …)
│   │   └──────────── y block: 500 m units
│   └──────────────── x block: 800 m units
└──────────────────── map sheet letter (80 km × 50 km)
```

Map sheet letters `A`–`W` cover Taiwan proper. Special sheets:

| Letter | Area |
| --- | --- |
| `S` | Matsu (馬祖) |
| `W` | Lanyu (蘭嶼) |
| `X`, `Y` | Penghu (澎湖) |
| `Z` | Kinmen (金門). An x block below `51` adds an extra 80 km x offset. |

`T67ToTPC` always returns the full 11-character code.

## Accuracy

Checked against the main-island points in `TriangulationPoints.xlsx` (492 points):

| Conversion | Median error | 95th percentile |
| --- | --- | --- |
| T67 → T97 | ~0.6 m | ~9.6 m |
| WGS84 → T97 | ~1.2 m | — |
| T97 → WGS84 | < 0.01 m | — |

- **T67 ⇄ T97** uses a fixed four-parameter (affine) transform. It is an approximation, so errors of several meters are normal in some areas.
- **T97 ⇄ WGS84** uses the GRS80 ellipsoid and TM2 projection (central meridian 121°E, k₀ = 0.9999, false easting 250,000 m).

## Limitations

- **No input checks:** Invalid TPC codes or points outside every map sheet will throw an error or return `NaN`.

## Known issues

- **Offshore islands:** All T67/T97 ⇄ WGS84 math uses Taiwan's 121°E TM2 zone. Taipower grids for Kinmen, Matsu and Penghu use other projections, so:
  - Kinmen (`Z`) and Matsu (`S`): TPC ⇄ T67 grid math is correct, but WGS84 results are off by over 100 km (e.g. `Z0054EC0222` lands about 113 km from its real location).
  - Penghu (`X`, `Y`): WGS84 results are off by about 60 km (e.g. `Y4087DD1053`).

## License

[MIT](LICENSE) © 2016 Ryan Juan
