export function resolvePackageManagerSupport(packageManager) {
  const match = /^(pnpm)@([0-9]+\.[0-9]+\.[0-9]+)$/.exec(packageManager ?? '');
  if (!match) {
    throw new Error('packageManager must be a pinned pnpm version such as pnpm@9.15.9');
  }
  const [, name, version] = match;
  const spec = `${name}@${version}`;
  return {
    requirement: Object.freeze({ name, version, spec }),
    fallbackCommands: Object.freeze({
      install: 'npm install --package-lock=false',
      doctor: 'npm run doctor',
      dev: 'npm run dev',
      verify: 'npm run verify',
    }),
  };
}

export function detectPackageManager(userAgent, requirement) {
  const value = userAgent ?? '';
  if (
    new RegExp(`(?:^|\\s)${requirement.name}/${requirement.version}(?:\\s|$)`).test(
      value,
    )
  ) {
    return { name: requirement.name, version: requirement.version };
  }

  const npmMatch = /(?:^|\s)npm\/([0-9]+\.[0-9]+\.[0-9]+)(?:\s|$)/.exec(value);
  if (npmMatch) {
    return { name: 'npm', version: npmMatch[1] };
  }

  return null;
}
