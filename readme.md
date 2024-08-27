# This is a converter to convert openscad code to jscad
## Getting started
**Initial setup**

Currently tree-sitter-openscad requires Python (it might be possible to remove this requirement by compiling the parser to wasm)

``` 
git clone https://github.com/cookiecad/Openscad-to-JSCAD-converter.git 
cd Openscad-to-JSCAD-converter
pnpm i
```
**Usage**

There is now a UI - which is a lot easier to use and troubleshoot.

```
  cd ./converter-ui
  pnpm dev
```

To use the CLI instead:
```
node ./converter/index.js ./test-files/custom-honeycomb-wall-v2.1.scad
```

This will create the jscad file and some other formats in the output folder. You can view the result by copying the contents of ./output/output-cadit.js to cadit.app. Click "Add your own", paste the results and click generate.

**How it works**
Openscad code is parsed using the tree-sitter-openscad library.
grammarToJscadSyntax.js converts the openscad grammar to jscad syntax. 
This is mostly used as a starting point and allows simple mappings to work without additional code. More complex syntax conversions are done by overriding the generated syntax in jscadSyntax.js

# Other parser / generator tools considered
Nearly
Peg.js