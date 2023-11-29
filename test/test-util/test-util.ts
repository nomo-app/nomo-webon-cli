import { exec } from "child_process";
import { join } from "path";

export function buildCliCommand(args: string) {
  const cliCommand = process.platform === "win32" ? "nomo-webon-cli" : join(process.cwd(), "bin", "nomo-webon-cli");
  
  return `${process.platform === "win32" ? "npx " : ""}${cliCommand} ${args}`;
}

export async function runE2ETest(
  args: string,
  options?: { pwd?: string; maxTime?: number }
): Promise<string> {
  const cmd = buildCliCommand(args);
  return await runCommand(cmd, options?.pwd);
}

export async function runE2ETestExpectFailure(
  args: string,
  pwd?: string
): Promise<string> {
  const cmd = buildCliCommand(args);
  return await runCommandExpectFailure(cmd, pwd);
}

function runCommand(cmd: string, pwd?: string): Promise<string> {
  cmd = buildFinalCommand(cmd, pwd);
  console.log(`Run command \'${cmd}\'`);
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      console.log(stdout);
      if (error) {
        console.error(stderr);
        console.error(`Failed to execute \'${cmd}\'. See the output above.`);
        reject(stdout + stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

function runCommandExpectFailure(
  cmd: string,
  pwd?: string,
  env?: Record<string, string | undefined>
): Promise<string> {
  cmd = buildFinalCommand(cmd, pwd);
  console.log(`Run expect-fail-command \'${cmd}\'`);

  return new Promise((resolve, reject) => {
    exec(cmd,{env: env}, (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error && error.code !== 0) {
        resolve(stdout + stderr);
      } else {
        console.error(
          `error: command \'${cmd}\' succeeded although we expected an error`
        );
        reject(stdout);
      }
    });
  });
}

function buildFinalCommand(cmd: string, pwd?: string) {
    return cmd;
}
