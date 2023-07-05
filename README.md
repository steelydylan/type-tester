# HTML Browser Tester

HTML Based browser tester without Node.js, Especially for HTML, CSS tests

## Install

```
npm install html-browser-tester
```

## Example

```js
import { BrowserTester } from 'html-browser-tester'

const html = `
  <!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello</title>
    <style>
      h1 {
        color: #000;
      }
    </style>
  </head>
  <body>
    <h1>Title1</h1>
    <h2>Title2</h2>
  </body>
  </html>
`

const main = async () => {
  const browserTester = new BrowserTester({ html, width: 980, height: 980 })

  browserTester.test('h1,h2 textContent should have right textContent', async (_, doc) => {
    const h1 = doc.querySelector('h1')
    const h2 = doc.querySelector('h2')
    browserTester.expect(h1?.textContent).toBe('Title1')
    browserTester.expect(h2?.textContent).toBe('Title2')
  })

  browserTester.test('title should have right textContent', async (_, doc) => {
    const title = doc.querySelector('title')
    browserTester.expect(title?.textContent).toBe('Hello')
  })

  browserTester.test('h2 should have red text', async (window, doc) => {
    const h2 = doc.querySelector('h2')
    browserTest.expect(window.getComputedStyle(h2).color).toBe('rgb(255, 0, 0)')
  })

  const results = await browserTester.run()

  console.log(results)
  /*
   [
    { description: 'h1,h2 textContent should have right textContent', result: true },
    { description: 'title should have right textContent', result: true },
    { description: 'h2 should have red text', result: true }
   ]
  */
}

main()
```

### Evaluate

You can also evaluate template literals to run tests

```js
browserTest.evaluate(`
  test('h1,h2 textContent should have right textContent', async (_, doc) => {
    const h1 = doc.querySelector('h1')
    const h2 = doc.querySelector('h2')
    expect(h1?.textContent).toBe('Title1')
    expect(h2?.textContent).toBe('Title2')
  })

  test('title should have right textContent', async (_, doc) => {
    const title = doc.querySelector('title')
    expect(title?.textContent).toBe('Hello')
  })

  test('h2 should have red text', async (window, doc) => {
    const h2 = doc.querySelector('h2')
    expect(window.getComputedStyle(h2).color).toBe('rgb(255, 0, 0)')
  })
`)
const results = await browserTester.run()
```
