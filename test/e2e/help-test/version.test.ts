import { runE2ETest } from "../../test-util/test-util";

test("--version", async () => {
  const output = await runE2ETest(`--version`, {
    pwd: "/",
  });
  expect(output).toContain("0.");
});

test("-v", async () => {
  const output = await runE2ETest(`-v`);
  expect(output).toContain("0.");
});
