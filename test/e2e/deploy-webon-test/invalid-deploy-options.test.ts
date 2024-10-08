import { runE2ETestExpectFailure } from "../../test-util/test-util";
import { getDebugPath } from "../../../src/util/util";
import path from "path";

test("missing manifest", async () => {
  const output = await runE2ETestExpectFailure("deploy src production");
  expect(output).toContain(
    `ERROR: ${getDebugPath(
      path.join("src", "nomo_manifest.json")
    )} does not exist.\n`
  );
});

test("archive not existing", async () => {
  const output = await runE2ETestExpectFailure(
    "deploy some-non-existing-archive production"
  );
  expect(output).toContain(
    `ERROR: ${getDebugPath("some-non-existing-archive")} does not exist.\n`
  );
});

test("invalid archive, not a .tar.gz", async () => {
  const output = await runE2ETestExpectFailure(
    "deploy src/util/util.ts production"
  );
  expect(output).toContain(
    `ERROR: Invalid archive: src/util/util.ts. It should end with ".tar.gz"\n`
  );
});
