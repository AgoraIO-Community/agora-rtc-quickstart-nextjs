import fs from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Docker credential ownership', () => {
  it('keeps Agora credentials out of the image build', () => {
    const dockerfile = fs.readFileSync('Dockerfile', 'utf8');

    expect(dockerfile).not.toMatch(/^(?:ARG|ENV) NEXT_PUBLIC_AGORA_APP_ID/m);
    expect(dockerfile).not.toContain('NEXT_AGORA_APP_CERTIFICATE');
    expect(dockerfile).toContain('CMD ["node", "server.js"]');
  });
});
