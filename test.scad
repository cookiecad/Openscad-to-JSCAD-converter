//edwin: Now 100% compatible with original. 
//I also configured the gridsize for a bambulabs printer. (10 x 10 cells)

/*[ Hex unit size ]*/

//Depth of the grid
depth = 8;
//Width of the hexagon's hole (flat side to flat side)
hole_width = 20;
//Thickness of the wall forming each hexagon
wall_thickness = 1.8;

/*[ Grid size settings ]*/
max_grid_width=211;
max_grid_height=248;

/*[ Grid shape ]*/
//If checked, ignores custom column sizes and fills grid to maximum size.
fill=true;;
flip_staggering=true;
//Amount of hexagons per column. Each entry defines a one column, where the number specifies the amount of hex units that will be generated for the respective column. (Ignored if "fill" is checked)
columns=[3,5,8,6,4,3,4,5,6];
include_offsets=false;
//Optional: Offset for each column. This will ignore grid size limits.
column_offsets=[0,-2,-3,-1,0,2,4];
include_gaps=false;
//Optional: Gaps for each column. *NOTE: Change these values in the code. Seems like 2D vector parameters aren't supported by the parameter editor and are always overwritten by the defaults.
column_gaps=[[], [3,4], [4,5], [2]];

/*[ Flat edges ]*/
edge_left = false;
edge_top = false;
edge_right = false;
edge_bottom = false;


//Calculated global variables
//Hexagon dimensions
hex_inner_r = hole_width/sqrt(3); //Inner radius/side length (center to point)
hex_h=hole_width+wall_thickness*2; //Outer side to side distance
hex_s=hex_h/sqrt(3); //Outer radius/side length 
hex_d=2*hex_s; //Outer diameter (point to point)
hex_t=hex_s/2;
//Grid dimensions
max_grid_hexagons_x = fill? floor(max_grid_width/(hex_d-hex_t) +(edge_left?0.5:0) +(edge_right?0.5:0)): len(columns);
max_grid_hexagons_y = fill? floor(max_grid_height/hex_h +(edge_top?0.5:0) +(edge_bottom?0.5:0)): max(columns);
max_grid_hexagons_y_lo = fill? floor(max_grid_height/hex_h - 0.5 +(edge_top?0.5:0) +(edge_bottom?0.5:0)): (max(columns) - 0.5);
total_width = max_grid_hexagons_x * (hex_d-hex_t) + hex_t;
total_height = hex_h*max(max_grid_hexagons_y - 0.5, max_grid_hexagons_y_lo);


translate([edge_left?0:hex_s, edge_top?0:-hex_h/2, 0])
grid(columns, include_offsets?column_offsets:[], include_gaps?column_gaps:[], depth, hole_width, wall_thickness, fill);


module grid(cols, offsets, gaps, height, hole_width, wall_width, fill){    
    for(hcol = [0:fill?max_grid_hexagons_x-1:(len(cols)-1)]){
        for(hrow = [0:(fill?(max_grid_hexagons_y-1):(cols[hcol]-1))]) {
            skip = hcol<len(gaps) && len(search(hrow+1, gaps[hcol])) > 0;          
            if(!skip){
                offset_value=hcol>len(offsets)-1?0:offsets[hcol];
                
                lo = (hcol+(flip_staggering?1:0))%2;
                x = (hex_d-hex_t)*hcol;
                y = -(hex_h)*(hrow + offset_value + lo/2);                
                
                if(hcol<max_grid_hexagons_x && hrow<(lo==0?max_grid_hexagons_y:max_grid_hexagons_y_lo)){
                    left = edge_left && hcol==0;
                    top = edge_top && hrow==0 && hcol%2==(flip_staggering?1:0);
                    right = edge_right && hcol==max_grid_hexagons_x-1;
                    bottom = edge_bottom && hrow+1==(lo==0?max_grid_hexagons_y:max_grid_hexagons_y_lo) && -y+hex_h>total_height+0.001 && -y+hex_h/2<=total_height;
                    translate([x, y, 0]) halfhex(height, hex_s, wall_width, hole_width, left, top, right, bottom);
                }
            }        
        }
    }
}

module halfhex(height, radius, wall_thickness, hole_width, left, top, right, bottom){
    difference(){
        union(){
            hex(height, radius, wall_thickness, hole_width);
            if(left) translate([0, hex_h/2, 0]) wall(depth, wall_thickness, hex_h);
            if(top) translate([hex_d/2, 0, 0]) rotate([0,0,-90]) wall(depth, wall_thickness, hex_d);
            if(right) translate([0, -hex_h/2, 0]) rotate([0,0,180]) wall(depth, wall_thickness, hex_h);
            if(bottom) translate([-hex_d/2, 0, 0]) rotate([0,0,90]) wall(depth, wall_thickness, hex_d);
        }
        if(left) translate([-hex_d/2, -hex_h, 0]) cube([hex_d/2, 2*hex_h, depth]);
        if(top) translate([-hex_d/2, 0, 0]) cube([hex_d, hex_h, depth]);
        if(right) translate([0, -hex_h, 0]) cube([hex_d/2, 2*hex_h, depth]);
        if(bottom) translate([-hex_d/2, -hex_h, 0]) cube([hex_d, hex_h, depth]);
    }
}

module hex(height, radius, wall_thickness, hole_width){
    for(i=[0:5]){
        rotate([0,0,i*60+30])
        translate([-hole_width/2-wall_thickness, radius/2, 0])
        wall(height, wall_thickness, radius);
    }
}

module wall(height, wall_thickness, length){
    hmax=height;
    hmin=5.1;
    hd=2;
    tmax=wall_thickness;
    tmin=wall_thickness-1;   
    //ft = 0.18;//fillet thickness
    ft = 0.4;//fillet thickness. (edwin: should be 0.4 to make it the same as the original)
    fh = 0.5;//fillet height
    
    difference(){
        rotate([90,0,0])
            linear_extrude(length)   
            polygon([[0,0], [0,hmax], [tmin,hmax], [tmin,hmax-hd], [tmax,hmin], [tmax,fh], [tmax-ft,0]]);
        //Fillet
        rotate([0,0,-30])
            cube([4*tmax, 2*tmax, hmax]);
        mirror([0,1,0])
            translate([0,length,0])
            rotate([0,0,-30])
            cube([4*tmax, 2*tmax, hmax]);
    }
}