const {
  primitives: { circle, cube, cuboid, cylinder, ellipsoid, polygon, roundedCuboid, roundedCylinder, sphere, torus },
  transforms: { center, translate, mirrorX, mirrorY, rotate },
  booleans: { union, subtract },
  hulls: { hull, hullChain },
  text: { vectorText },
  colors: { colorize, colorNameToRgb, hexToRgb },
  extrusions: { extrudeLinear, extrudeRotate },
  maths: { vec2 },
} = require('@jscad/modeling')

const paint = (color, elem) => colorize(colorNameToRgb(color), elem)

const x = (points, paths) => {
  return extrudeLinear({ height: 3 }, polygon({ points, ...(paths ?? {}) }))
}

const repeat = (offset, source, from, to) => {
  const direction = from > to ? -1 : 1
  const result = []
  for (let i = from; i != to; i += direction) {
    offset = repeatLine(offset, source, i, i + direction)
    result.push(offset)
  }
  return result
}

const repeatLine = (offset, source, i, i2) => {
  return [
    offset[0] + source[i][0] - source[i2][0],
    offset[1] + source[i][1] - source[i2][1],
  ]
}

const main = (params) => {
  const opts = { params, resolution: { segments: params.hires ? 64 : 16 } }
  const face = [
    [423, 531], [456, 529], [464, 523], [471, 517], [480, 464], [374, 425], [365, 404], [320, 390],
  ]
  const antler2 = [
    [311, 368], [344, 256], [361, 240], [519, 233], [535, 205], [397, 207], [382, 193],
    [379, 177], [421, 101], [379, 118], [328, 199], [266, 362], [272, 379],
    [198, 354],
  ]
  const antler1 = [
    [190, 344], [187, 332], [205, 270], [169, 285], [157, 329], [161, 342],
    [111, 324], [99, 311], [91, 300], [90, 282], [101, 261], [116, 252], [259, 240], [271, 214],
    [130, 216], [115, 208], [110, 195], [181, 17], [132, 61], [73, 197], [49, 290],
    [56, 336], [83, 366], [118, 382]
  ]
  const head = [...face, ...antler2, ...antler1]
  const mirrorAntler1 = repeat(antler1[23], antler1, 22, 18)
  const mirrorAntlers = repeat(head[0], head, 0, 38)
  const frontLegs = [
    // leg1
    [57, 1120], [36, 1191], [33, 1396], ...repeat([33, 1396], antler1, 17, 18), [106, 1207], [191, 993],
    // leg2
    [246, 1003], [180, 1477], [211, 1461], [354, 1017], [400, 1000], [350, 1390],
  ]
  const mirrorFrontLegs = repeat(frontLegs[11], frontLegs, 10, 3)
  const deer = center({ axes: [true, true, true] }, x([
    ...mirrorAntlers.reverse(),
    ...head,
    ...mirrorAntler1,
    ...repeat(mirrorAntler1[mirrorAntler1.length - 1], frontLegs, 2, 0),
    ...frontLegs,
    ...mirrorFrontLegs,
  ]))
  const herd = (colors, offset = [0, 0, 0]) => {
    return [
      paint(colors[1], translate([offset[0] + 98, offset[1] - 1329, 0], deer)),
      paint(colors[0], translate([offset[0] + 59, offset[1] - 433, 0], mirrorY(mirrorX(deer)))),
      paint(colors[1], translate(offset, deer)),
      paint(colors[2], translate([offset[0] - 39, offset[1] + 896, 0], mirrorY(mirrorX(deer)))),
      paint(colors[1], translate([offset[0] - 98, offset[1] + 1329, 0], deer)),
    ]
  }
  console.log(params)
  return params.herd || true
    ? [
      ...herd(['coral', 'peachpuff', 'lightcoral']),
      ...herd(['seagreen', 'palegreen', 'limegreen'], [648, 315, 0]),
      ...herd(['royalblue', 'lightsteelblue', 'navy'], [2 * 648, 2 * 315, 0]),
      ...herd(['crimson', 'thistle', 'firebrick'], [3 * 648, 3 * 315, 0]),
    ]
    : [deer]
}

const getParameterDefinitions = () => [
  //{ name: 'hires', type: 'checkbox', checked: true, initial: 0, caption: 'high resolution' },
  { name: 'herd', type: 'checkbox', checked: true, initial: 0, caption: 'herd' },
]

module.exports = { main, getParameterDefinitions }
//module.exports = { main }
