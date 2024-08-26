/* This contains helper scripts that will be placed in the generated code, plus some utility functions */

import chalk from 'chalk'
import dedent from 'dedent'

export const log = (color, msg) => console.log(chalk[color](msg))
export const out = (color, msg) => process.stdout.write(chalk[color](msg))

export const scopes = [new Set()] // Initialize the global scope

// Whenever a new block scope starts (module or function)
export function startNewScope () {
  scopes.push(new Set())
}

// Whenever a block scope ends
export function endCurrentScope () {
  scopes.pop()
}

const transformChainCounter = [0]

export const inTransformChain = () => transformChainCounter[transformChainCounter.length - 1] > 0
export function pushTransformChain () {
  transformChainCounter.push(0)
}
export function popTransformChain () {
  transformChainCounter.pop()
}
export function startTransformChain () {
  transformChainCounter[transformChainCounter.length - 1]++
}
export function endTransformChain () {
  transformChainCounter[transformChainCounter.length - 1]--
}

export const helperFunctions = [
  dedent`
  function inlineIf(condition, ifTrue, ifFalse) {
    let jscadObjects = [];
    if (condition) ifTrue(jscadObjects)
    else ifFalse(jscadObjects)
    return jscadObjects;
  }`,
  // dedent`
  // function inlineFor(init, test, increment, body) {
  //   let jscadObjects = []
  //   for (let i = init; test(i); i = increment(i)) {
  //     jscadObjects.push(body(i))
  //   }
  //   return jscadObjects
  // }`,
  dedent`
  function inlineFor(values, body) {
    // Initialize result array
    let jscadObjects = [];
    
    // Check if values is a vector
    if (Array.isArray(values)) {
      for (let i = 0; i < values.length; i++) {
        let context = values[i];
        jscadObjects.push(body(context));
      }
    } else {
      let {start, increment, end} = values;
      let condition = (increment > 0) ? (i) => i <= end : (i) => i >= end;
      for (let i = start; condition(i); i += increment) {
        jscadObjects.push(body(i));
      }
    }
    
    return jscadObjects.flat();
  }`,
  dedent`
  function rotateDegrees(...args) {
    return rotate(args[0].map(i => i * Math.PI / 180), ...args.slice(1));
  }`,
  dedent`
  function polygonEnsureCounterclockwise(...args) {
    let points = args[0].points;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      let j = (i + 1) % points.length;
      area += points[i][0] * points[j][1];
      area -= points[j][0] * points[i][1];
    }
    if (area < 0) {
      points.reverse();
    }
    return polygon(...args);
  }`
]
