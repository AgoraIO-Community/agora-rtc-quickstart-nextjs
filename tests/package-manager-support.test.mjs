import { describe, expect, it } from 'vitest';
import {
  isRequiredPackageManager,
  resolvePackageManagerSupport,
} from '../scripts/package-manager-support.mjs';

describe('package manager support', () => {
	it('accepts only the pinned pnpm version', () => {
		const support = resolvePackageManagerSupport('pnpm@9.15.9');
		expect(isRequiredPackageManager('pnpm/9.15.9 npm/? node/v22.22.1', support.requirement)).toBe(true);
		expect(isRequiredPackageManager('pnpm/9.15.8 npm/? node/v22.22.1', support.requirement)).toBe(false);
		expect(isRequiredPackageManager('npm/11.0.0 node/v22.22.1', support.requirement)).toBe(false);
		expect(isRequiredPackageManager(undefined, support.requirement)).toBe(false);
	});

	it('exposes the pinned requirement and zero-global-install fallback', () => {
		const support = resolvePackageManagerSupport('pnpm@9.15.9');
		expect(support.requirement).toEqual({
			name: 'pnpm',
			version: '9.15.9',
			spec: 'pnpm@9.15.9',
		});
		expect(support.fallbackCommands).toEqual({
			install: 'npx --yes pnpm@9.15.9 install --frozen-lockfile',
      doctor: 'npx --yes pnpm@9.15.9 run doctor',
      dev: 'npx --yes pnpm@9.15.9 dev',
      verify: 'npx --yes pnpm@9.15.9 run verify',
		});
	});

	it('derives fallback commands from package.json instead of a duplicated version', () => {
		const support = resolvePackageManagerSupport('pnpm@10.1.2');
		expect(support.requirement.version).toBe('10.1.2');
		expect(support.fallbackCommands.dev).toBe('npx --yes pnpm@10.1.2 dev');
	});
});
