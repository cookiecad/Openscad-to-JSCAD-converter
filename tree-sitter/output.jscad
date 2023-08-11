depth = 8
hole_width = 20
wall_thickness = 1.8
max_grid_width = 211
max_grid_height = 248
fill = true
flip_staggering = true
columns = [3, 5, 8, 6, 4, 3, 4, 5, 6]
include_offsets = false
column_offsets = [0, -2, -3, -1, 0, 2, 4]
include_gaps = false
column_gaps = [[], [3, 4], [4, 5], [2]]
edge_left = false
edge_top = false
edge_right = false
edge_bottom = false
hex_inner_r = hole_width / Math.sqrt(3)

hex_h = hole_width + wall_thickness * 2
hex_s = hex_h / Math.sqrt(3)

hex_d = 2 * hex_s
hex_t = hex_s / 2
max_grid_hexagons_x = fill ? Math.floor(max_grid_width / (hex_d - hex_t) + (edge_left ? 0.5 : 0) + (edge_right ? 0.5 : 0))
 : columns.length
max_grid_hexagons_y = fill ? Math.floor(max_grid_height / hex_h + (edge_top ? 0.5 : 0) + (edge_bottom ? 0.5 : 0))
 : Math.max(columns)

max_grid_hexagons_y_lo = fill ? Math.floor(max_grid_height / hex_h - 0.5 + (edge_top ? 0.5 : 0) + (edge_bottom ? 0.5 : 0))
 : (Math.max(columns)
 - 0.5)
total_width = max_grid_hexagons_x * (hex_d - hex_t) + hex_t
total_height = hex_h * Math.max(max_grid_hexagons_y - 0.5, max_grid_hexagons_y_lo)


translate([edge_left ? 0 : hex_s, edge_top ? 0 : -hex_h / 2, 0])
grid(columns, include_offsets ? column_offsets : [], include_gaps ? column_gaps : [], depth, hole_width, wall_thickness, fill);

function grid(cols, offsets, gaps, height, hole_width, wall_width, fill) {

        const jscadObjects = [];

        for (let hcol of Array.from({length: fill ? max_grid_hexagons_x - 1 : (cols.length - 1) - 0 + 1 }, (_, i) => 0 + i )) {
for (let hrow of Array.from({length: (fill ? (max_grid_hexagons_y - 1) : (cols[hcol] - 1)) - 0 + 1 }, (_, i) => 0 + i )) {
skip = hcol < gaps.length && search(hrow + 1, gaps[hcol])
.length > 0
if(!skip)offset_value = hcol > offsets.length - 1 ? 0 : offsets[hcol]
lo = (hcol + (flip_staggering ? 1 : 0)) % 2
x = (hex_d - hex_t) * hcol
y = -(hex_h) * (hrow + offset_value + lo / 2)
if(hcol < max_grid_hexagons_x && hrow < (lo == 0 ? max_grid_hexagons_y : max_grid_hexagons_y_lo))left = edge_left && hcol == 0
top = edge_top && hrow == 0 && hcol % 2 == (flip_staggering ? 1 : 0)
right = edge_right && hcol == max_grid_hexagons_x - 1
bottom = edge_bottom && hrow + 1 == (lo == 0 ? max_grid_hexagons_y : max_grid_hexagons_y_lo) && -y + hex_h > total_height + 0.001 && -y + hex_h / 2 <= total_height

translate([x, y, 0])
halfhex(height, hex_s, wall_width, hole_width, left, top, right, bottom);
}

}


        return jscadObjects;

      }


function halfhex(height, radius, wall_thickness, hole_width, left, top, right, bottom) {

        const jscadObjects = [];

        
difference()
union()
hex(height, radius, wall_thickness, hole_width);if(left)
translate([0, hex_h / 2, 0])
wall(depth, wall_thickness, hex_h);if(top)
translate([hex_d / 2, 0, 0])
rotate([0, 0, -90])
wall(depth, wall_thickness, hex_d);if(right)
translate([0, -hex_h / 2, 0])
rotate([0, 0, 180])
wall(depth, wall_thickness, hex_h);if(bottom)
translate([-hex_d / 2, 0, 0])
rotate([0, 0, 90])
wall(depth, wall_thickness, hex_d);if(left)
translate([-hex_d / 2, -hex_h, 0])
cube([hex_d / 2, 2 * hex_h, depth]);if(top)
translate([-hex_d / 2, 0, 0])
cube([hex_d, hex_h, depth]);if(right)
translate([0, -hex_h, 0])
cube([hex_d / 2, 2 * hex_h, depth]);if(bottom)
translate([-hex_d / 2, -hex_h, 0])
cube([hex_d, hex_h, depth]);

        return jscadObjects;

      }


function hex(height, radius, wall_thickness, hole_width) {

        const jscadObjects = [];

        for (let i of Array.from({length: 5 - 0 + 1 }, (_, i) => 0 + i )) {

rotate([0, 0, i * 60 + 30])
translate([-hole_width / 2 - wall_thickness, radius / 2, 0])
wall(height, wall_thickness, radius);
}


        return jscadObjects;

      }


function wall(height, wall_thickness, length) {

        const jscadObjects = [];

        hmax = height
hmin = 5.1
hd = 2
tmax = wall_thickness
tmin = wall_thickness - 1
ft = 0.4
fh = 0.5

difference()
rotate([90, 0, 0])
linear_extrude(length)
polygon([[0, 0], [0, hmax], [tmin, hmax], [tmin, hmax - hd], [tmax, hmin], [tmax, fh], [tmax - ft, 0]]);
rotate([0, 0, -30])
cube([4 * tmax, 2 * tmax, hmax]);
mirror([0, 1, 0])
translate([0, length, 0])
rotate([0, 0, -30])
cube([4 * tmax, 2 * tmax, hmax]);

        return jscadObjects;

      }
