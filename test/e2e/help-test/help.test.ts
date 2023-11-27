import { runE2ETest, runE2ETestExpectFailure } from "../../test-util/test-util";

test("--help", async () => {
  const output = await runE2ETest(`--help`, {
    pwd: "/",
  });
  expect(output).toContain("Usage: nomo-webon-cli");
});

test("-h", async () => {
  const output = await runE2ETest(`-h`, {
    pwd: "/",
  });
  expect(output).toContain("Usage: nomo-webon-cli");
});

test("no arguments", async () => {
  const output = await runE2ETestExpectFailure("");
  expect(output).toContain("Usage: nomo-webon-cli");
});

test("unknown command", async () => {
  const output = await runE2ETestExpectFailure(`jivduns bhbd`);
  expect(output).toBe(
    "error: unknown command 'jivduns'. See 'nomo-webon-cli --help'.\n"
  );
});
