import React from "react";
import { render } from "react-dom";
import clsx from "clsx";
import { TypeTester } from "./lib";

const defaultCode = `import React from "react";
import { createRoot } from "react-dom/client";
import { foo } from "./sub";
import type { Speed } from "./sub";

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

function Hoge ({ onChange } : { onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return <input onChange={onChange} />
}

`;

const defaultSub = `
type Foo = string;

export type Speed = "slow" | "medium" | "fast";
export const foo: Foo = "foo";

`;

const load = async (code: string, files: Record<string, string>) => {
  const typeTest = new TypeTester({ code, files });

  await typeTest.setDependencies({
    "react-dom": "18.2.0",
    react: "18.2.0",
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

  typeTest.test("Hoge is not any", async () => {
    typeTest.expect("Hoge").not.toBeAny();
  });

  typeTest.test("Fuga is any", async () => {
    typeTest.expect("Fuga").toBeAny();
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

  typeTest.test("foo is string", async () => {
    typeTest.expect("foo").toBeType("string");
  });

  typeTest.test("foo is number", async () => {
    typeTest.expect("foo").toBeType("number");
  });

  typeTest.test("foo is not string", async () => {
    typeTest.expect("foo").not.toBeType("string");
  });

  typeTest.test("Hoge is valid Component", async () => {
    typeTest
      .expect("Hoge")
      .toBeType(
        "({ onChange }: { onChange: React.ChangeEventHandler<HTMLInputElement>; }) => JSX.Element"
      );
  });
  console.time("run");
  const result = await typeTest.run();
  console.timeEnd("run");
  return result;
};

const App = () => {
  const [script, setScript] = React.useState({
    "main.tsx": defaultCode,
    "sub.tsx": defaultSub,
  });
  const [tab, setTab] = React.useState<keyof typeof script>("main.tsx");

  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<
    { result: boolean; description: string }[]
  >([]);
  const runTest = async () => {
    setLoading(true);
    load(script["main.tsx"], { "/sub.tsx": script["sub.tsx"] }).then(
      (results) => {
        console.log(results);
        setResults(results);
        setLoading(false);
      }
    );
  };
  React.useEffect(() => {
    runTest();
  }, []);
  const handleClick = () => {
    runTest();
  };
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScript((script) => ({ ...script, [tab]: e.target.value }));
  };
  return (
    <div className="flex gap-5 p-5 h-full">
      <div className="flex-1 h-full">
        <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px">
            {(["main.tsx", "sub.tsx"] as const).map((item) => (
              <li key={item} className="mr-2">
                <button
                  onClick={() => setTab(item)}
                  className={clsx({
                    "inline-block p-4 border-b-2 rounded-t-lg": true,
                    "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300":
                      tab !== item,
                    "text-blue-600 border-blue-600 active dark:text-blue-500 dark:border-blue-500":
                      tab === item,
                  })}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <textarea
          key={tab}
          className="bg-gray-50 h-full p-2 w-full"
          onChange={handleChange}
          defaultValue={script[tab]}
        ></textarea>
      </div>
      <div className="flex-1">
        <p className="h-14 text-center font-bold text-lg">テスト結果</p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleClick}
        >
          テスト実行
        </button>
        <div>
          {loading ? (
            <div>loading...</div>
          ) : (
            results.map((result) => (
              <div style={{ color: result.result ? "green" : "red" }}>
                {result.description}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

render(<App />, document.getElementById("root"));
