import { TypeTester } from "./type-test";

const main = async () => {
  const code = `const h1: string = "title";
  type Fuga = { name: string; } & { age: number; };
  const fuga: Fuga = { name: "fuga", age: 20 };
  `;
  const typeTest = new TypeTester({ code });

  typeTest.test("h1 should be string", async () => {
    typeTest.expect("h1").toBeType("string");
  });

  typeTest.test("h1 should be number", async () => {
    typeTest.expect("fuga.name").toBeType("{ name: string; age: number; }");
  });

  const results = await typeTest.run();

  console.log(results);
};

main();
