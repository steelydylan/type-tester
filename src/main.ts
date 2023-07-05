import { TypeTester } from "./type-test";

const main = async () => {
  const code = `
  type Speed = "slow" | "medium" | "fast";

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

  typeTest.test("h1 should be string", async () => {
    typeTest
      .expect("getSpeed")
      .toBeType(`(speed: "slow" | "medium" | "fast") => number`);
  });

  const results = await typeTest.run();

  console.log(results);
};

main();
