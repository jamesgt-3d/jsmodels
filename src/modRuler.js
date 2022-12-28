const {
  primitives: { circle, cube, cuboid, cylinder, roundedCuboid, sphere, torus },
  transforms: { translate, mirrorX, rotate },
  booleans: { union, subtract },
  hulls: { hull, hullChain },
  text: { vectorText },
  colors: { colorize, colorNameToRgb, hexToRgb },
  extrusions: { extrudeLinear, extrudeRotate },
} = require('@jscad/modeling')

const paint = (color, elem) => colorize(colorNameToRgb(color), elem)
const side = 10
const bumperRadius = 1

const plug = (opts) => {
  const height = side / 2 - 2
  const plug = cylinder({ radius: side / 4, height, ...opts.resolution })
  const bumper = sphere({ radius: bumperRadius, ...opts.resolution })
  const bumperCoords = { x: 0, y: side / 4, z: side / 2 - bumperRadius - (side / 4 - 2 * bumperRadius) / 2 }

  const y = (height - 10) / 2
  return [
    translate([0, 0, -5 + height / 2], subtract(
      plug,
      union(
        translate([0, side / 4, 0], bumper),
        extrudeRotate({ ...opts.resolution, angle: Math.PI / 2 }, circle({ size: bumperRadius, center: [side / 4, 0] })),
        translate([side / 4, 0, 0], bumper),
        translate([side / 4, 0, height / 4], cylinder({ radius: bumperRadius, height: height / 2, ...opts.resolution })),
      ),
    )),
  ]
}

const connector = (opts) => {
  const base = cuboid({ size: [side, side, side] })
  const hole = cylinder({ radius: side / 4, height: side, ...opts.resolution })
  const bumper = sphere({ radius: bumperRadius, ...opts.resolution })
  const bumperCoords = { x: 0, y: side / 4, z: side / 2 - bumperRadius - (side / 4 - 2 * bumperRadius) / 2 }
  return [
    paint('orange', subtract(
      base,
      union(
        hole,
        rotate([Math.PI / 2, 0, 0], hole),
        rotate([0, Math.PI / 2, 0], hole),
      )
    )),
    paint('brown', union(
      translate([bumperCoords.x, bumperCoords.y, bumperCoords.z], bumper),
      translate([bumperCoords.x, bumperCoords.y, -bumperCoords.z], bumper),
      translate([bumperCoords.x, bumperCoords.z, -bumperCoords.y], bumper),
      translate([bumperCoords.x, -bumperCoords.z, -bumperCoords.y], bumper),
      translate([bumperCoords.z, bumperCoords.x, -bumperCoords.y], bumper),
      translate([-bumperCoords.z, bumperCoords.x, -bumperCoords.y], bumper),
    ))
  ]
}

const centerFinder = (opts) => {
  return [
    subtract(
      cube({ size: side }),
      rotate([0, Math.PI / 2, 0], cylinder({ radius: 7.5 / 2, height: side, ...opts.resolution })),
    ),
  ]
}

const mark = (elem, height, padding = 0, margin = 0.5, width = 0.2) => {
  const length = 5 - margin - padding / 2
  const line = cuboid({ size: [length, width, width] })
  const line1 = translate([5 - margin - length / 2, -5 + width / 2, height], line)
  const line2 = translate([-(5 - margin - length / 2), -5 + width / 2, height], line)
  const lines = union(line1, line2)
  return subtract(
    elem,
    union(
      lines,
      rotate([0, 0, Math.PI / 2], lines),
      rotate([0, 0, -Math.PI / 2], lines),
      rotate([0, 0, Math.PI], lines),
    ),
  )
}

const main = (params) => {
  const opts = { params, resolution: { segments: params.hires ? 32 : 16 } }
  return [union(
    params.setup.split(',')
      .map((elem) => elem.trim())
      .flatMap((elem) => {
        switch (elem.charAt(0)) {
          case 'C': return [connector(opts)]
          case 'F': return Array.from({ length: elem.length === 1 ? 1 : parseInt(elem.substring(2)) }).map(() => cube({ size: side }))
          case 'P': return [plug(opts)]
          case 'H': return [centerFinder(opts)]
          default: return []
        }
      })
      .map((elem) => union(elem))
      .map((elem) => params.marks ? mark(elem, side / 10 * 5) : elem) // mark at top
      .map((elem) => params.marks ? mark(elem, side / 10 * 4, 6) : elem)
      .map((elem) => params.marks ? mark(elem, side / 10 * 3, 6) : elem)
      .map((elem) => params.marks ? mark(elem, side / 10 * 2, 6) : elem)
      .map((elem) => params.marks ? mark(elem, side / 10 * 1, 6) : elem)
      .map((elem) => params.marks ? mark(elem, 0, 2) : elem) // params.marks ? mark at center
      .map((elem) => params.marks ? mark(elem, -side / 10 * 1, 6) : elem)
      .map((elem) => params.marks ? mark(elem, -side / 10 * 2, 6) : elem)
      .map((elem) => params.marks ? mark(elem, -side / 10 * 3, 6) : elem)
      .map((elem) => params.marks ? mark(elem, -side / 10 * 4, 6) : elem)
      .map((elem) => params.marks ? mark(elem, -side / 10 * 5) : elem) // mark at bottom
      .map((elem, i) => translate([0, 0, i * side], elem))
  )]
}

const getParameterDefinitions = () => [
  { name: 'hires', type: 'checkbox', checked: true, initial: 0, caption: 'high resolution' },
  { name: 'setup', type: 'text', caption: 'setup', placeholder: 'C,F,H,F,P' },
  { name: 'marks', type: 'checkbox', checked: true, initial: 0, caption: 'marks' },
]

module.exports = { main, getParameterDefinitions }
