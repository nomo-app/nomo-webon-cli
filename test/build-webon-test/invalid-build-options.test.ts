import { buildWebOn } from "../../src/build-webon/build-webon";
//import { runCliTestExpectFailure } from "../test-util/test-util";
import { getDebugPath } from "../../src/util/util";


describe('buildWebOn', () => {
  test('it should build the Next.js app and create a tar.gz file', async () => {
    // Use a temporary directory for testing
    const tempDir = 'build';
    const assetDir = 'out';

    // Mock necessary functions or modules
    const mockExecSync = jest.fn();
    const mockExistsSync = jest.fn();
    const mockMkdirSync = jest.fn();
    const mockTarCreate = jest.fn(() => Promise.resolve());

    jest.mock('child_process', () => ({
      execSync: mockExecSync,
    }));

    jest.mock('fs', () => ({
      existsSync: mockExistsSync,
      mkdirSync: mockMkdirSync,
    }));

    jest.mock('tar', () => ({
      create: mockTarCreate,
    }));

    await buildWebOn({ assetDir });

    // Add your assertions based on the expected behavior of your function
    expect(mockExistsSync).toHaveBeenCalledWith(assetDir);
    expect(mockExecSync).toHaveBeenCalledWith('npm run build', { stdio: 'inherit' });
    // Add more assertions based on your implementation
  });
});