import { runCliTest } from "../../test-util/test-util";

test("--version", async () => {
  const output = await runCliTest(`--version`, {
    pwd: "/",
  });
  expect(output).toContain("0.");
});

test("-v", async () => {
  const output = await runCliTest(`-v`);
  expect(output).toContain("0.");
});
