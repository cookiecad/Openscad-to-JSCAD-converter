function add(a,b) = a + b;
function func1(x=3) = 2*x+1;

echo(add(1,2));
echo(func1());
echo(func1(5));

a=add(1,2);

cube([a,a,a]);
