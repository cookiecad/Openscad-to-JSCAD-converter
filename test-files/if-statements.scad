  
a = 5;
b = 6;
  if (a==5) {
    if (b==6)
        cube([1,1,1]);
    else {
        translate([3,0,0])
        cylinder(1,1);
    }
  }
  
translate([10,0,0])
    union() {
        cube([1,1,1], center=true);
        if (b==1) cylinder(h=3,r=0.25, center=true);
        else cylinder(h=3,r=0.25, center=true);
        
        }
        