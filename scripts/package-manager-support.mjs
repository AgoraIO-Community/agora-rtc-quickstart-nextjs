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
      install: `npx --yes ${spec} install --frozen-lockfile`,
      doctor: `npx --yes ${spec} run doctor`,
      dev: `npx --yes ${spec} dev`,
      verify: `npx --yes ${spec} run verify`,
    }),
  };
}

export function isRequiredPackageManager(userAgent, requirement) {
  return new RegExp(`(?:^|\\s)${requirement.name}/${requirement.version}(?:\\s|$)`).test(
    userAgent ?? '',
  );
}
