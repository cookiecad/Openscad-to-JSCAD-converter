import jscad from '@jscad/modeling'

export function main() {
  const { primitives, booleans, transforms, extrusions } = jscad;
  const { cube, sphere, cylinder, polygon } = primitives;
  const { union, subtract, intersection } = booleans;
  const { translate, rotate, scale, mirror } = transforms;

  const { extrudeLinear } = extrusions
  function inlineIf(condition, ifTrue, ifFalse) {
let jscadObjects = [];
if (condition) return ifTrue(jscadObjects)
else return ifFalse(jscadObjects)
}
  function inlineFor(init, test, increment, body) {
let jscadObjects = []
for (let i = init; test(i); i = increment(i)) {
jscadObjects.push(body(i))
}
return jscadObjects
}

  const jscadObjects = [];




let depth = 8

let hole_width = 20

let wall_thickness = 1.8

let max_grid_width = 211
let max_grid_height = 248


let fill = true
let flip_staggering = true

let columns = [3, 5, 8, 6, 4, 3, 4, 5, 6]
let include_offsets = false

let column_offsets = [0, -2, -3, -1, 0, 2, 4]
let include_gaps = false

let column_gaps = [[], [3, 4], [4, 5], [2]]

let edge_left = false
let edge_top = false
let edge_right = false
let edge_bottom = false


let hex_inner_r = hole_width / Math.sqrt(3)

let hex_h = hole_width + wall_thickness * 2

let hex_s = hex_h / Math.sqrt(3)

let hex_d = 2 * hex_s

let hex_t = hex_s / 2

let max_grid_hexagons_x = fill ? Math.floor(max_grid_width / (hex_d - hex_t) + (edge_left ? 0.5 : 0) + (edge_right ? 0.5 : 0)) : columns.length
let max_grid_hexagons_y = fill ? Math.floor(max_grid_height / hex_h + (edge_top ? 0.5 : 0) + (edge_bottom ? 0.5 : 0)) : Math.max(columns)
let max_grid_hexagons_y_lo = fill ? Math.floor(max_grid_height / hex_h - 0.5 + (edge_top ? 0.5 : 0) + (edge_bottom ? 0.5 : 0)) : (Math.max(columns) - 0.5)
let total_width = max_grid_hexagons_x * (hex_d - hex_t) + hex_t
let total_height = hex_h * Math.max(max_grid_hexagons_y - 0.5, max_grid_hexagons_y_lo)
jscadObjects.push(  
translate([edge_left ? 0 : hex_s, edge_top ? 0 : -hex_h / 2, 0], 
grid(columns, include_offsets ? column_offsets : [], include_gaps ? column_gaps : [], depth, hole_width, wall_thickness, fill))
)

function grid(cols, offsets, gaps, height, hole_width, wall_width, fill) {

      const jscadObjects = [];

        for (let hcol of Array.from({length: fill ? max_grid_hexagons_x - 1 : (cols.length - 1) - 0 + 1 }, (_, i) => 0 + i )) {
  for (let hrow of Array.from({length: (fill ? (max_grid_hexagons_y - 1) : (cols[hcol] - 1)) - 0 + 1 }, (_, i) => 0 + i )) {
    let skip = hcol < gaps.length && search(hrow + 1, gaps[hcol]).length > 0
    if ((!skip)) {
      let offset_value = hcol > offsets.length - 1 ? 0 : offsets[hcol]
      let lo = (hcol + (flip_staggering ? 1 : 0)) % 2
      let x = (hex_d - hex_t) * hcol
      let y = -(hex_h) * (hrow + offset_value + lo / 2)
      if ((hcol < max_grid_hexagons_x && hrow < (lo == 0 ? max_grid_hexagons_y : max_grid_hexagons_y_lo))) {
        let left = edge_left && hcol == 0
        let top = edge_top && hrow == 0 && hcol % 2 == (flip_staggering ? 1 : 0)
        let right = edge_right && hcol == max_grid_hexagons_x - 1
        let bottom = edge_bottom && hrow + 1 == (lo == 0 ? max_grid_hexagons_y : max_grid_hexagons_y_lo) && -y + hex_h > total_height + 0.001 && -y + hex_h / 2 <= total_height
        jscadObjects.push(  
          translate([x, y, 0], 
          halfhex(height, hex_s, wall_width, hole_width, left, top, right, bottom)),
        )
      }
      
    }
    
  }
  
}


      return jscadObjects;

    }


function halfhex(height, radius, wall_thickness, hole_width, left, top, right, bottom) {

      const jscadObjects = [];

        jscadObjects.push(  
  subtract(  
    union(
    hex(height, radius, wall_thickness, hole_width),
    inlineIf((left), (jscadObjects) => jscadObjects.push(  
      translate([0, hex_h / 2, 0], 
      wall(depth, wall_thickness, hex_h))
    ), (jscadObjects) => {return []}),
    inlineIf((top), (jscadObjects) => jscadObjects.push(  
      translate([hex_d / 2, 0, 0],   
        rotate([0, 0, -90], 
        wall(depth, wall_thickness, hex_d)))
    ), (jscadObjects) => {return []}),
    inlineIf((right), (jscadObjects) => jscadObjects.push(  
      translate([0, -hex_h / 2, 0],   
        rotate([0, 0, 180], 
        wall(depth, wall_thickness, hex_h)))
    ), (jscadObjects) => {return []}),
    inlineIf((bottom), (jscadObjects) => jscadObjects.push(  
      translate([-hex_d / 2, 0, 0],   
        rotate([0, 0, 90], 
        wall(depth, wall_thickness, hex_d)))
    ), (jscadObjects) => {return []}),),
  inlineIf((left), (jscadObjects) => jscadObjects.push(  
    translate([-hex_d / 2, -hex_h, 0], 
    cube([hex_d / 2, 2 * hex_h, depth]))
  ), (jscadObjects) => {return []}),
  inlineIf((top), (jscadObjects) => jscadObjects.push(  
    translate([-hex_d / 2, 0, 0], 
    cube([hex_d, hex_h, depth]))
  ), (jscadObjects) => {return []}),
  inlineIf((right), (jscadObjects) => jscadObjects.push(  
    translate([0, -hex_h, 0], 
    cube([hex_d / 2, 2 * hex_h, depth]))
  ), (jscadObjects) => {return []}),
  inlineIf((bottom), (jscadObjects) => jscadObjects.push(  
    translate([-hex_d / 2, -hex_h, 0], 
    cube([hex_d, hex_h, depth]))
  ), (jscadObjects) => {return []}),),
)

      return jscadObjects;

    }


function hex(height, radius, wall_thickness, hole_width) {

      const jscadObjects = [];

        for (let i of Array.from({length: 5 - 0 + 1 }, (_, i) => 0 + i )) {
  jscadObjects.push(  
    rotate([0, 0, i * 60 + 30],   
      translate([-hole_width / 2 - wall_thickness, radius / 2, 0], 
      wall(height, wall_thickness, radius))),
  )
}


      return jscadObjects;

    }


function wall(height, wall_thickness, length) {

      const jscadObjects = [];

        let hmax = height
let hmin = 5.1
let hd = 2
let tmax = wall_thickness
let tmin = wall_thickness - 1

let ft = 0.4

let fh = 0.5

jscadObjects.push(  
  subtract(  
    rotate([90, 0, 0],   
      extrudeLinear({height: length}, 
      polygon({points: [[0, 0], [0, hmax], [tmin, hmax], [tmin, hmax - hd], [tmax, hmin], [tmax, fh], [tmax - ft, 0]]})})),
    
    rotate([0, 0, -30], 
    cube([4 * tmax, 2 * tmax, hmax])),  
    mirror({normal: [0, 1, 0],   
      translate([0, length, 0],   
        rotate([0, 0, -30], 
        cube([4 * tmax, 2 * tmax, hmax])))}),),
)

      return jscadObjects;

    }

return jscadObjects;
  }

