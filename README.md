node-bff
========

**node-bff** (BrainFuckFramework) is a collection of tools related to BrainFuck coding.

# Examples

# API

### `BFF.parse(code)`
Parses given BrainFuck code and gives back BIR object. 

## BFF.BIR

**BIR** is an object (internal representation) representing a BF code.

### `BIR.parse(code)`
Same as `BFF.parse`.

### `BIR.prototype.toBrainFuck()`
Convert the BIR object to the BF code.

### `BIR.prototype.optimize([disables])`

## BFF.BInterp
**BInterp** object is an interpreter interprets given BIR.

### `new BInterp([option], [print, [read, [debug]]])`
* `option`: Currently this is ignored. In future, various options, such as cell size (currently always `256`), will be given by this object.
* `function print(data, callback)`: This is called when a string is being printed. `data` is an array of bytes to be printed, and `callback` is an callback which should be called after printing is done.
* `function read(callback)`: This is called when an input is needed. `callback` should be called with an argument, which is an array of bytes which will be inputted.
* `function debug(debug_info, callback)`: Currently this is ignored. In future, this function will be called when debugging is needed.

# Commands
