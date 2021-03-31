import fs from 'fs';
import path from 'path';

const currentVersion = require('../package.json').version;
if (!currentVersion) throw new Error("Can't detect library version.");

const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
const changelog = fs.readFileSync(changelogPath, { encoding: 'utf-8' });
if (changelog.includes(`## [${currentVersion}]`))
  throw new Error('Current version has already been documented.');
let futureChangelog = '';

// Add version section
let arr = changelog.split('## [Unreleased]');
arr[1] =
  `
## [${currentVersion}] - ${new Date().toISOString().slice(0, 10)}
### Removed:
- **[BREAKING]** description
### Changed:
-
### Added:
-
### Fixed:
- ` + arr[1];
futureChangelog = arr.join('## [Unreleased]');

// Update footer
arr = futureChangelog
  .split('\n')
  .map((line) =>
    line.startsWith('[Unreleased]')
      ? `[Unreleased]: https://github.com/Snazzah/duck-duck-scrape/compare/v${currentVersion}...HEAD`
      : line
  );

// eslint-disable-next-line no-useless-escape
const lastVersion = ([...arr].reverse()[1].match(/\[([^\][]*)]/) || [])[0].replace(/[[\]']+/g, '');
if (!lastVersion) throw new Error("Can't find last version in changelog.");

const lastLine = `[${currentVersion}]: https://github.com/Snazzah/duck-duck-scrape/compare/v${lastVersion}...v${currentVersion}`;
if (arr[arr.length - 1] === '') arr[arr.length - 1] = lastLine;
else arr.push(lastLine);
futureChangelog = arr.join('\n');

fs.writeFileSync(changelogPath, futureChangelog);
