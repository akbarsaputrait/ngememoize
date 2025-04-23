/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: [
    'master',
    { name: 'beta', prerelease: true },
    { name: 'testing', prerelease: true },
  ],
  repositoryUrl: 'https://github.com/akbarsaputrait/ngememoize',
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: 'dist/ngememoize',
      },
    ]
  ],
};
