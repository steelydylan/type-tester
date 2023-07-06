# TypeTest

## Usage

```ts
import { TypeTester } from "./type-test";

const code = `
  type Speed = "slow" | "medium" | "fast";

  const speed: Speed[] = ["slow"];

function getSpeed(speed: Speed): number {
  switch (speed) {
    case "slow":
      return 10;
    case "medium":
      return 50;
    case "fast":
      return 200;
  }
}
  `;
const typeTest = new TypeTester({ code });

typeTest.test("getSpeed function should return number", () => {
  typeTest
    .expect("getSpeed")
    .toBeType(`(speed: "slow" | "medium" | "fast") => number`);
});

const results = await typeTest.run();

console.log(results);
```
