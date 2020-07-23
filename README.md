# estest

Native ESM test system.

Estest defines a test format that is completely agnostic of test frameworks
and requires no globals to be injected into the environments. Tests are ESModules
and `estest` will run them on any JS platform that supports native ESM (Node.js,
Deno, Browser[WIP], etc).

### Running in Node.js

```
npx estest test.js
```

### Running in Deno

```
deno run --allow-read https://raw.githubusercontent.com/mikeal/estest/master/deno.js test.js
```

## Test Authoring

The test format is very simple and does not require you to import `estest` or take
on any aspects of a framework.

Tests are async functions. They fail if they throw, they succeed if they complete.

Tests are run concurrently by default, so if you have state to setup before the
tests you simply nest your tests and run the requisite code first.

You have a few options for how to export tests.

### Default Function exports

```js
export default async test => {
  await setupWhateverIWant()
  test('first test!, async test => {
    // passes
  })
  test('first fail!', test => {
    throw new Error('Fail!')
  })
}
```

### Array of tests (no names)

```js
const tests = []
tests.push(async test => { /* passes */ })
tests.push(test => { throw new Error('Fail!') })

export { tests }
```

### Object of tests (w/ names)

```js
const tests = {
 'first test!: async test => { /* passes */ },
 'first fail!': test => { throw new Error('Fail!') })
}
export { tests }
```

## Nesting tests

```js
const addRecursive = (test, i=0) => {
  if (i > 100) return
  test(`recursion at ${i}`, test => addRecursive(test, i+1))
}

export default test => {
  setupAFewThings()
  test('first', test => {
    setupMoreThings()
    test('first nesting', async test => {
      await setupAsyncThings()
      test('we can do this literally forever', async test => {
        addRecursive(test)
      })
    })
  })
}
```

As you can see, this API is a very powerful way generate tests programatically.

## Test cleanup

The `test` function also has a `.after()` method that will run after the function
is completed whether it passes or fails.

```js
test('one', async test => {
  let env
  test.after(() => {
    if (!env) {
      test('node', () => {
        /* passes */
      })
    }
  })
  if (!process.browser) throw new Error('Not browser')
  env = process.browser
})
```

