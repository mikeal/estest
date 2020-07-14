# estest

Native ESM test system.

Estest defines a test format that is completely agnostic of test frameworks
and requires no globals to be injected into the environments. Tests are ESModules
and `estest` will run them on any JS platform that supports native ESM (Node.js,
Deno, Browser[WIP], etc).

### Running in Node.js

```
npx estest test/test-*.js
```

### Running in Deno

deno run --allow-read https://raw.githubusercontent.com/mikeal/estest/master/deno.js test/test-*.js

## Test Authoring

TODO
