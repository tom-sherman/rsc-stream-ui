import { appendGenerator, updateGenerator } from "@/lib/generator";

export default function Home() {
  return (
    <main>
      <h2>Update:</h2>
      <UpdateStream />
      <h2>Append:</h2>
      <AppendStream />
    </main>
  );
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

const AppendStream = appendGenerator(async function* () {
  await wait(1000);
  yield <p>Hello!</p>;
  await wait(1000);
  yield <p>World!</p>;
});

const UpdateStream = updateGenerator(async function* () {
  await wait(200);
  yield <p>Woo!</p>;
  await wait(200);
  yield <p>Woooo!</p>;
  await wait(200);
  yield <p>Woooooooo!</p>;
  await wait(200);
  yield <p>Woooooooooooooo!</p>;
  await wait(200);
  yield <p>Wooooooooooooooooooooooooooo!</p>;
  await wait(200);
  yield <p>Wooooooooooooooooooooooooooooooooooooooo!</p>;
});
