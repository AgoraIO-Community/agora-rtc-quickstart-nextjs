import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('development runtime', () => {
  it('uses the Next.js default runtime so first-route compilation preserves active calls', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
    );

    expect(packageJson.scripts.dev).toBe('next dev');
  });
});
