import { describe, expect, it } from 'vitest';
import {
	detectPackageManager,
	resolvePackageManagerSupport,
} from '../scripts/package-manager-support.mjs';

describe('package manager support', () => {
	it('accepts exact pnpm or npm from a supported Node installation', () => {
		const support = resolvePackageManagerSupport('pnpm@9.15.9');
		expect(detectPackageManager('pnpm/9.15.9 npm/? node/v22.22.1', support.requirement)).toEqual({ name: 'pnpm', version: '9.15.9' });
		expect(detectPackageManager('pnpm/9.15.8 npm/? node/v22.22.1', support.requirement)).toBeNull();
		expect(detectPackageManager('npm/10.9.4 node/v22.22.1', support.requirement)).toEqual({ name: 'npm', version: '10.9.4' });
		expect(detectPackageManager(undefined, support.requirement)).toBeNull();
	});

	it('exposes the pinned requirement and native npm fallback', () => {
		const support = resolvePackageManagerSupport('pnpm@9.15.9');
		expect(support.requirement).toEqual({
			name: 'pnpm',
			version: '9.15.9',
			spec: 'pnpm@9.15.9',
		});
		expect(support.fallbackCommands).toEqual({
			install: 'npm install --package-lock=false',
			doctor: 'npm run doctor',
			dev: 'npm run dev',
		});
	});

	it('keeps npm fallback independent of the pinned pnpm version', () => {
		const support = resolvePackageManagerSupport('pnpm@10.1.2');
		expect(support.requirement.version).toBe('10.1.2');
		expect(support.fallbackCommands.dev).toBe('npm run dev');
	});
});
