import { buildWebOn } from "../../../src/build-webon/build-webon";
import { enableUnitTest } from "../../../src/util/util";
import tar from "tar";
import { join, resolve } from "path";
import { existsSync, mkdirSync, readdirSync, renameSync } from "fs";

enableUnitTest();

jest.mock("fs");
jest.mock("tar");

test("Should create a tar.gz WebOn file", async () => {
  const mockExistsSync = jest.spyOn(require("fs"), "existsSync");
  const mockMkdirSync = jest.spyOn(require("fs"), "mkdirSync");
  const mockRenameSync = jest.spyOn(require("fs"), "renameSync");
  const mockTarCreate = jest.spyOn(tar, "create");

  // Set up mock data and expectations
  const assetDir = "test/out";
  const outDir = resolve(assetDir);
  const outDirPath = resolve(assetDir, "..", "out");

  mockExistsSync.mockReturnValueOnce(true); // "out" directory doesn't exist
  mockRenameSync.mockImplementationOnce((source, destination) => {
    expect(source).toBe(assetDir);
    expect(destination).toBe(outDirPath);
  });
  mockMkdirSync.mockImplementationOnce((path) => {
    expect(path).toBe(outDir);
  });

  console.log('Directory exists:', existsSync(assetDir));
  // Run the function
  await buildWebOn({ assetDir });

  expect(mockExistsSync).toHaveBeenCalledWith(assetDir);
 // expect(mockRenameSync).toHaveBeenCalled();
  expect(mockMkdirSync).toHaveBeenCalled();
  expect(mockTarCreate).toHaveBeenCalledWith(
    {
      file: expect.any(String),
      gzip: true,
    },
    [outDir]
  );

  // Clear mocks after the test
  jest.clearAllMocks();
});