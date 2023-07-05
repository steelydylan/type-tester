import { TypeTester } from "./type-test";

const main = async () => {
  const code = `const h1 = "title"
  const fuga: string[] = ["fuga"]
  const foo: { hoge: string } = { hoge: "hoge" }

  type Piyo = {
    piyo: string[]
  }

  const piyo: Piyo = {
    piyo: ["piyo"]
  }
  ;

  `;
  const typeTest = new TypeTester({ code });

  typeTest.test("h1 should be string", async () => {
    typeTest.expect("h1").toBeType("string");
  });

  typeTest.test("fuga should be string[]", async () => {
    typeTest.expect("fuga").toBeType("string[]");
  });

  typeTest.test("piyo should be string[]", async () => {
    typeTest.expect("piyo").toBeType("boolean");
  });

  typeTest.test("foo should be { hoge: string }", async () => {
    typeTest.expect("foo").toBeType("{ hoge: string }");
  });

  typeTest.test("piyo should be { piyo: string[] }", async () => {
    typeTest.expect("piyo").toBeType("{ piyo: string[] }");
  });

  const results = await typeTest.run();

  console.log(results);
};

main();
