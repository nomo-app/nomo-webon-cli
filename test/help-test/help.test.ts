import {
  runCliTest,
  runCliTestExpectFailure
} from "../test-util/test-util";

test("--help", async () => {
  const output = await runCliTest(`--help`, {
    pwd: "/"
  });
  expect(output).toContain("Usage: nomo-webon-cli");
});

test("-h", async () => {
  const output = await runCliTest(`-h`, {
    pwd: "/"
  });
  expect(output).toContain("Usage: nomo-webon-cli");
});

test("no arguments", async () => {
  const output = await runCliTestExpectFailure("");
  expect(output).toContain(
    "Usage: nomo-webon-cli"
  );
});

test("unknown command", async () => {
  const output = await runCliTestExpectFailure(`jivduns bhbd`);
  expect(output).toBe(
    "error: unknown command 'jivduns'. See 'nomo-webon-cli --help'.\n"
  );
});
