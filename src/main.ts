import { TypeTester } from "./type-test";

const main = async () => {
  const code = `
  type Speed = "slow" | "medium" | "fast";

  const speeds: Speed[] = ["slow"];

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

  typeTest.test("speed type should be ", async () => {
    typeTest.expect("speeds").toBeType(`("slow" | "medium" | "fast")[]`);
  });

  typeTest.test("speed type should be ", async () => {
    typeTest
      .expect("getSpeed")
      .toBeType(`(speed: "slow" | "medium" | "fast") => number`);
  });

  typeTest.test("speed type should be valid", async () => {
    typeTest.expect("Speed").toBe(`"slow" | "medium" | "fast"`);
  });

  const results = await typeTest.run();

  console.log(results);
};

main();
