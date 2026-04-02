import { cp, mkdir, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(rootDir, "src");
const distDir = path.join(rootDir, "dist");

async function copyCssModules(currentDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await copyCssModules(entryPath);
        return;
      }

      if (!entry.name.endsWith(".css")) {
        return;
      }

      const relativePath = path.relative(srcDir, entryPath);
      const destination = path.join(distDir, relativePath);
      await mkdir(path.dirname(destination), { recursive: true });
      await cp(entryPath, destination);
    }),
  );
}

await copyCssModules(srcDir);
