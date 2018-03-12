[![Build Status](https://travis-ci.org/walmartlabs/json-patchwork.svg?branch=master)](https://travis-ci.org/walmartlabs/json-patchwork)

# API
This is an implementation of the [JSON Patchwork Specification](#specification-for-implementation).

## `patch(target, source, patches)`
Applies patches from a [Patchwork Object](#patchwork-object) to a target document.

### Arguments
1. `target` *(Object or Array)*: The document receiving the patches.
1. `source` *(Object or Array)*: The document source for the patch values.
1. `patches` *(Array)*: An array of patches to apply.
  - `target` *(Object)* Target configuration for patch.
    - `path` *(String)*: The target path for the patch application.
    - `tests` *(Array)* An array of tests for equality or values that reduce the target of the patch application.
  - `source` *(Object)* Source configuration for patch.
    - `path` *(String)*: The source path for the patch application values.
    - `tests` *(Array)* An array of tests for equality or values that reduce the source of the patch application.
  - [`collect`] *(Boolean)*: Collect the values from the target and the source as opposed to replacing the target values
  with source values.
  - [`merge`] *(Boolean)*: Merge source value with target value.
  - [`unique`] *(Boolean)*: Ensure that the value for a given target is unique, e.g, all array values are unique.
  - [`depth`] *(Number)*: The depth to traverse up the source object graph for a source value. The value at the
  given depth will be applied to the target document for the patch. Depth must be a negative number.
  - [`operations`] *(Array)* Operations to perform on all values for each patch operation a patch definition executes.

```javascript
var Patchwork = require('json-patchwork');
var target = { foo: { bar: 1 } };
var source = { baz: 2 };
var patches = [{
  target: { path: '/foo' },
  source: { path: '/' }
  merge: true
}];

Patchwork.patch(target, source, patches);
/*
  Result:
  {
    foo: {
      bar: 1,
      baz: 2
    }
  }
 */
```

## `register(name, fn)`
Registers an operator that can be configured as part of a patch operation that performs an operation against a patch
value.

### Arguments
1. `name` *(String)*: The name of the operator.
1. `fn` *(Function)*: The function that will operate on a patch. *MUST* return a value.
    - `operation` *(Object)*: Contains patches for a patch operation and meta data.
    - `value` *(Object, Array, or Primative)*: The value being modified.

```javascript
var Patchwork = require('json-patchwork');

Patchwork.register('custom' function (operation, value) {
  // do something interesting
  return value;
});
```

## `unregister(name)`
Registers an operator that can be configured as part of a patch operation that performs an operation against a patch
value.

### Arguments
1. `name` *(String)*: The name of the operator.

```javascript
var Patchwork = require('json-patchwork');

Patchwork.unregister('custom');
```

## `get(input, path, def)`
Get a value using a patchwork compatible path.

### Arguments
1. `input` *(Object)*: Source object.
1. `path` *(Array|String)*: Key-path to get.
1. `def` *(Mixed)*: Default value.

#### Returns
*(Mixed)*: The value for the path.

```javascript
var Patchwork = require('json-patchwork');
var source = {
  foo: ['bar', 'baz']
};
var val = Patchwork.get(source, '/foo/1')

/*
  Result:
  'baz'
 */

```

## `set(input, path, value)`
Set a value using a patchwork compatible path.

### Arguments
1. `input` *(Object)*: Target object.
1. `path` *(Array|String)*: Key-path to set.
1. `value` *(Mixed)*: Value to set.

#### Returns
*(Object)*: The target object.

```javascript
var Patchwork = require('json-patchwork');
var target = {
  foo: ['bar', 'baz']
};
var val = Patchwork.set(target, '/foo/1', 'something')

/*
  Result:
  {
    foo: ['bar', 'something']
  }
 */

```

## `expand(subject, path, strict, asArray)`
Expand a Patchwork compatible path.

### Arguments
1. `subject` *(Object)*: Source to walk through.
1. `path` *(String|Array)*: Path to expand.
1. `strict` *(Boolean)*: Only return valid paths.
1. `asArray` *(Boolean)*: Return an array instead of a string.

#### Returns
*(Array)*: The expanded path

```javascript
var Patchwork = require('json-patchwork');
var subject = {
  foo: ['bar', 'baz']
};
var paths = Patchwork.expand(subject, '/foo/@');

/*
  Result:
  [ '/foo/0', '/foo/1' ]
 */

```

## `split(path)`
Split a path; Removes falsy values and ignores escaped path delimiters

### Arguments
1. `path` *(String|Array)*: String path to split.

#### Returns
*(Array)*: Path parts.

```javascript
var Patchwork = require('json-patchwork');
var path = '/foo/bar/baz';
var paths = Patchwork.split(path);

/*
  Result:
  [ 'foo', 'bar', 'baz' ]
 */

```

# Included Operators
The following [operators](#operations) are included with JSON Patchwork.

## Shape
Used to shape patch values. Virtual patches are used to perform patches on a per shape
basis.

```javascript
var Patchwork = require('json-patchwork');
var source = {
  foo: [{ id: 1, prop: 'here' }, { id: 2, prop: 'there' }, { id: 3, prop: 'everywhere' }]
};
var target = {};
var patches = [{
  target: { path: '/bar' },
  source: { path: '/foo/@' },
  collect: true,
  operations: [{
    type: 'shape',
    virtual: {
      microverse: [{
        target: {
          path: '/microverse'
        },
        source: {
          path: '/prop',
          tests: [{
            path: '/prop',
            operator: '==',
            value: 'everywhere'
          }]
        }
      }]
    },
    shape: {
      id: 'id',
      b: 'prop',
      c: '$microverse'
    }
  }]
}];

Patchwork.patch(target, source, patches);
/*
  Result:
  { bar:
     [ { id: 1, b: 'here', c: null },
       { id: 2, b: 'there', c: null },
       { id: 3, b: 'everywhere', c: 'everywhere' } ] }
 */
```

# Specification for Implementation
The library is based on the JSON Patchwork specification defined below.


## JSON Patchwork v1
JSON Patchwork defines a JSON document structure for expressing a sequence of value patching
operations to apply from a source JSON document to a target JSON document.

## Source Documents
Values (patches) are extracted from source documents based upon [patch operations](#patchwork-object).

## Target Documents
Values (patches) from the source document are applied to target document based upon
[patch operations](#patchwork-object).

## Patchwork Documents
A JSON Patchwork document is a JSON document that represents an array of [patch operation](#patchwork-object)
objects. Each object represents a target to apply a source patch.

### Patchwork Object
A JSON Patchwork object maps a (dynamic) target path to instructions to a (dynamic) source path for applying patches.

#### Target Path
The target path of a patchwork object identifies the path which to apply patches from a source document.

```javascript
[{
  "target": {
    "path": "/target/path"
  }
}]
```

#### Source Path
The source path of a patchwork object identifies the path from which patch values should be resolved in the source document.

```javascript
[{
  "target": {
    "path": "/target/path"
  }
  "source": {
    "path": "/source/path"
  }
}]
```

## Paths
Paths are used in JSON Patchwork documents to identify a location in a target or source document.

### Path Traversal
Forward slashes in JSON Patchwork paths denote traversal into an a document. For example, `/foo/bar` would resolve
to `{ "foo": { "bar": 1 } }` returning the value of the `bar` property. `/foo/bar/baz/0` would resolve to
`{ "foo": { "bar": { "baz": ["some value"] } } }` returning the first element in the `baz`property array. All
[JSON Patch](https://tools.ietf.org/html/rfc6902) paths are valid.

### Iterator Token
The `@` character can be used in a path to identify an object or array in a path that should be expanded. In the case of an array,
`/foo/@` would expand `{ "foo": [1, 2] }` to the JSON Patch paths `/foo/0` and `/foo/1`. In the case of an object
`/foo/@` would expand `{ "foo": { "bar": 1, "baz": 2 } }` to the JSON Patch paths `/foo/bar` and `/foo/baz`.

Iterator tokens can be combined with static path parts to extract single property values as well. For example `/foo/@/baz` would expand
`{ "foo": { "bar": { "baz": 2 }, "foo": { "baz": 2 } } }` to the JSON Patch paths `/foo/bar/baz` and `/foo/foo/baz`.

Multiple iterator tokens can be used in a path to iterate into a path of objects and arrays. For example `/foo/@/bar/@` would expand
`{ { "foo": { "prop1": { "bar": [1, 2] }, "prop2": { "bar": [1, 2] } } }` to the JSON Patch paths `/foo/prop1/0`, `/foo/prop1/1`,
`/foo/prop2/0`, and `/foo/prop2/1`.

### Path Expansion and Patch Application
There are 4 different patching scenarios. If a path doesn't exist during a patch operation it will be created within the limits
of the patching rules.

#### Static Target Path and Static Source Path
If both the target and source paths are static then the value from the source path is set at the target path.

```javascript
var Patchwork = require('json-patchwork');
var target = {};
var source = { foo: { bar: 'baz' } };
var patches = [{
  "target": {
    "path": "/here"
  },
  "source": {
    "path": "/foo"
  }
}];

Patchwork.patch(target, source, patches);

/*
  Result:
  {
    { here: { bar: 'baz' } }
  }
 */
```

#### Static Target Path and Dynamic Source Path
If the target path is static and the source path is dynamic then source path will be expanded and the value at the last token
will be set at the target path.

```javascript
var Patchwork = require('json-patchwork');
var target = {};
var source = { foo: [1, 2, 3, 4] };
var patches = [{
  "target": {
    "path": "/here"
  },
  "source": {
    "path": "/foo/@"
  }
}];

Patchwork.patch(target, source, patches);

/*
  Result:
  {
    { here: 4 }
  }
 */
```

#### Dynamic Target Path and Static Source Path
If the target path is dynamic and source path is static then the value from the source path is set to the
expanded target paths.

```javascript
var Patchwork = require('json-patchwork');
var target = { here: [1, 2, 3, 4] };
var source = { foo: [5, 6, 7, 8] };
var patches = [{
  "target": {
    "path": "/here/@"
  },
  "source": {
    "path": "/foo"
  }
}];

Patchwork.patch(target, source, patches);

/*
  Result:
  {
    { here: [ [ 5, 6, 7, 8 ], [ 5, 6, 7, 8 ], [ 5, 6, 7, 8 ], [ 5, 6, 7, 8 ] ] }
  }
 */
```

#### Dynamic Target Path and Dynamic Source Path
If both the target and source paths are dynamic then the value from the value at the last token
of the source will be set at each expanded target path.

##### Intersection
```javascript
var Patchwork = require('json-patchwork');
var target = { foo: [1, 2, 3, 4] };
var source = { foo: [5, 6, 7, 8, 9] };
var patches = [{
  "target": {
    "path": "/foo/@"
  },
  "source": {
    "path": "/foo/@"
  }
}];

Patchwork.patch(target, source, patches);

/*
  Result:
  {
    { foo: [ 9, 9, 9, 9 ] }
  }
 */
```

### Patch Modifiers
Patch modifiers describe how patch values should be applied in addition to the rules/scenarios defined in
[Paths](#paths).

#### Merge
If `merge` is `true` the source value is merged into the target value.

```javascript
var Patchwork = require('json-patchwork');
var target = { foo: [1, 2] };
var source = { bar: [5, 6] };
var patches = [{
  "merge": true,
  "target": {
    "path": "/"
  },
  "source": {
    "path": "/"
  }
}];

Patchwork.patch(target, source, patches);

/*
  Result:
  {
    { foo: [ 1, 2 ], bar: [ 5, 6 ] }
  }
 */
```

#### Collect
If `collect` is `true` then values are "collected" instead of being replaced.

##### Array Example
```javascript
var Patchwork = require('json-patchwork');
var target = { foo: [1, 2] };
var source = { bar: [5, 6] };

var patches = [{
  "collect": true,
  "target": {
    "path": "/foo"
  },
  "source": {
    "path": "/bar"
  }
}];

Patchwork.patch(target, source, patches);

/*
  Result:
  {
    { foo: [ 1, 2, 5, 6 ] }
  }
 */
```

##### Object Example
Collected objects are transformed into array like objects.

```javascript
var Patchwork = require('json-patchwork');
var target = {};
var source = { foo: 1, bar: 2, baz: 3 };

var patches = [{
  "collect": true,
  "target": {
    "path": "/"
  },
  "source": {
    "path": "/@"
  }
}];

Patchwork.patch(target, source, patches);

/*
  Result:
  {
    { '0': 1, '1': 2, '2': 3, length: 3 }
  }
 */
```

#### Depth
The depth modifier specifies a distance to traverse up the source object graph path from the source value. This path is applied to
the target path when the patch operation is applied. Depth must be a negative number.

```javascript
var Patchwork = require('json-patchwork');
var target = { foo: { bar: [], baz: [] } };
var source = { foo: { bar: [ [ { here: 1 } ] ], baz: [ [ { there: 2 } ] ] } };
var patches = [{
  "depth": -2,
  "target": {
    "path": "/foo/@"
  },
  "source": {
    "path": "/foo/@/@/@"
  }
}];

Patchwork.patch(target, source, patches);

/*
  Result:
  {
    "foo": {
      "bar": [
        [
          {
            "there": 2
          }
        ]
      ],
      "baz": [
        [
          {
            "there": 2
          }
        ]
      ]
    }
  }
 */
```

### Operations
The `operations` property of the patchwork object contains instructions for altering patch values.

```javascript
[{
  "target": { "path": "/target/path" },
  "source": { "path": "/source/path" }
  "operations": [{}]
}]
```

#### Example Operation
```javascript
[{
  "target": { "path": "/target/path" },
  "source": { "path": "/source/path" }
  operations: [{
    type: 'shape',
    shape: {
      id: 'id',
      a: 'prop'
    }
  }]
}]
```

The specification implementation should pass the operation definition and the value to a function that implements
the operation. The implementation should return the modified value.

### Tests
An array of tests for equality or values that reduce the target or source of a patch application.

```javascript
[{
  "target": { "path": "/target/path", "tests": [] },
  "source": { "path": "/source/path", "tests": [] }
}]
```

#### Example Test
```javascript
[{
  "target": { "path": "/target/path" },
  "source": {
    "path": "/source/path",
    "tests": [{
      path: '/prop',
      operator: '==',
      value: 'everywhere'
    }]
  }
}]
```

#### Supported Test Operators
This is not a final draft. The list is limited to the required use cases upon specification draft. Tests will likely expand and change.

* '==': equals
* '!=': not equals
* '===': strict equals
* '!==': strict not equals
* '~': regular expression
* '!~': negated regular expression
*  'in': in an array or object
* 'notIn' not in an array or object

Wrapping the above test operators in parens () will compare the same path in the source and target. 
Example:
```javascript
{
  "target": {
    "path": "/path/@"
  },
  "source": {
    "path": "/path/@",
    "tests": [
      {
        "path": "/path/@/target",
        "operator": "(==)",
        "value": "/path/@/path/target/"
      }
    ]
  }
}
```
