const {
  primitives: { circle, cube, cuboid, cylinder, ellipsoid, roundedCuboid, roundedCylinder, sphere, torus },
  transforms: { translate, mirrorX, rotate },
  booleans: { union, subtract },
  hulls: { hull, hullChain },
  text: { vectorText },
  colors: { colorize, colorNameToRgb, hexToRgb },
  extrusions: { extrudeLinear, extrudeRotate },
} = require('@jscad/modeling')

const main = (params) => {
  const opts = { params, resolution: { segments: params.hires ? 64 : 16 } }
  const eye = [
    subtract(
      ellipsoid({ radius: [25 + 0.2, 15 + 0.2, 15 + 0.2], ...opts.resolution }),
      ellipsoid({ radius: [25, 15, 15], ...opts.resolution }),
      cube({ size: 50, center: [0, 0, -25 - 12] }),
    ),
  ]

  return [
    union(...eye),
  ]
}

const getParameterDefinitions = () => [
  { name: 'hires', type: 'checkbox', checked: true, initial: 0, caption: 'high resolution' },
  { name: 'setup', type: 'text', caption: 'setup', placeholder: 'C,F,H,F,P' },
  { name: 'marks', type: 'checkbox', checked: true, initial: 0, caption: 'marks' },
]

module.exports = { main, getParameterDefinitions }
