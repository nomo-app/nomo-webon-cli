import {
  runUnitTestExpectFailure,
  runE2ETest,
} from "../../test-util/test-util";
import { createTarFile } from "../../../src/build-webon/build-webon";
import * as fs from "fs";
import * as path from "path";
import * as tar from "tar";

test("missing required file", async () => {
  const output = await runUnitTestExpectFailure(
    "build test_assets/out_incomplete/out"
  );
  expect(output).toMatch(
    /Error: The 'out' directory is missing the following required files: .* Use nomo-webon-cli init if you do not have a nomo_manifest.json yet.\n/
  );
});

jest.mock("fs");
jest.mock("tar");

describe("createTarFile", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should create a tar file with the correct options", async () => {
    const outDirPath = "/test_assets/my_sample/out";
    const tarFilePath = "/test_assets/my_sample/out/nomo.tar.gz";

    const existsSyncMock = jest.spyOn(fs, "existsSync");
    existsSyncMock.mockReturnValue(true);

    const createMock = tar.create as jest.Mock;
    createMock.mockResolvedValue(undefined);

    await createTarFile(outDirPath, tarFilePath);

    expect(existsSyncMock).toHaveBeenCalledWith(outDirPath);
    expect(createMock).toHaveBeenCalledWith(
      {
        file: tarFilePath,
        gzip: true,
        cwd: path.dirname(outDirPath),
      },
      [path.basename(outDirPath)]
    );
    expect(fs.existsSync(tarFilePath)).toBe(true);
  });
});
