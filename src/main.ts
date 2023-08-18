import { TypeTester } from "./type-test";

const main = async () => {
  const code = `
  import React from "react";
  import { render } from "react-dom";
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

  declare function promiseAll<T extends any[]>(values: readonly [...T]): Promise<{
    [P in keyof T]: Awaited<T[P]>
  }>

  const promise1 = Promise.resolve(3);
  const promise2 = 42;
  const promise3 = new Promise<string>((resolve, reject) => {
    setTimeout(resolve, 100, 'foo');
  });

  type Hoge = any;
  type Fuga = string;

  const hoge: Hoge = "hoge";
  const fuga: Fuga = "fuga";

  `;
  const typeTest = new TypeTester({
    code,
  });

  await typeTest.setDependencies({
    react: "18.2.0",
    "react-dom": "18.2.0",
  });

  typeTest.test("speed type should be valid", async () => {
    typeTest.expect("speeds").toBeType(`("slow" | "medium" | "fast")[]`);
  });

  typeTest.test("speed type should be valid", async () => {
    typeTest
      .expect("getSpeed")
      .toBeType(`(speed: "slow" | "medium" | "fast") => number`);
  });

  typeTest.test("speed type should be valid", async () => {
    typeTest.expect("Speed").toBe(`"slow" | "medium" | "fast"`);
  });

  typeTest.test("promiseAll should be valid", async () => {
    typeTest
      .expect(
        `promiseAll([
      Promise.resolve(3), 
      42, 
      new Promise<string>((resolve, reject) => {
        resolve('foo')
      })
    ] as const)`
      )
      .toBeType(`Promise<[number, 42, string]>`);
  });

  typeTest.test("Hoge is any", async () => {
    typeTest.expect("Hoge").toBeAny();
  });

  typeTest.test("Fuga is not any", async () => {
    typeTest.expect("Fuga").not.toBeAny();
  });

  typeTest.test("hoge is any", async () => {
    typeTest.expect("hoge").toBeTypeAny();
  });

  typeTest.test("fuga is not any", async () => {
    typeTest.expect("fuga").not.toBeTypeAny();
  });

  const results = await typeTest.run();
  // domに結果を表示する
  let dom = document.getElementById("results") as HTMLDivElement;
  if (!dom) {
    dom = document.createElement("div");
    dom.setAttribute("id", "results");
    document.body.appendChild(dom);
  }
  results.forEach((result) => {
    const div = document.createElement("div");
    div.textContent = result.description;
    if (result.result) {
      div.style.color = "green";
    } else {
      div.style.color = "red";
    }
    dom.appendChild(div);
  });
};

main();
