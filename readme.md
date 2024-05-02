# This is a converter to convert openscad code to jscad
## Getting started
**Initial setup**

Currently tree-sitter-openscad requires Python (it might be possible to remove this requirement by compiling the parser to wasm)

``` 
git clone https://github.com/cookiecad/Openscad-to-JSCAD-converter.git 
cd Openscad-to-JSCAD-converter
npm i
```
**Usage**
```
node ./converter/index.js ./test-files/custom-honeycomb-wall-v2.1.scad
```

This will create the jscad file and some other formats in the output folder. You can view the result by copying the contents of ./output/output-cadit.js to cadit.app. Click "Add your own", paste the results and click generate.

# Other parser / generator tools considered
Nearly
Peg.js