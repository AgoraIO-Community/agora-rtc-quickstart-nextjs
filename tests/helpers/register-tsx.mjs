// Use the installed TypeScript compiler to execute TSX in Node without a browser.
import { registerHooks } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

export default function registerTsx(root) {
  return registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier.startsWith('@/')) {
        const stem = resolve(root, specifier.slice(2));
        const path = [stem + '.tsx', stem + '.ts'].find(existsSync);
        if (path) return { url: pathToFileURL(path).href, shortCircuit: true };
      }
      return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
      if (url.startsWith('file:') && /\.tsx?$/.test(url)) {
        const path = fileURLToPath(url);
        const source = ts.transpileModule(readFileSync(path, 'utf8'), {
          compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
          fileName: path,
        }).outputText;
        return { format: 'commonjs', source, shortCircuit: true };
      }
      return nextLoad(url, context);
    },
  });
}
