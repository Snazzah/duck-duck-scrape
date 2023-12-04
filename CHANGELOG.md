# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
## [2.2.5] - 2023-12-04
### Fixed:
- Added request anomaly detection ([#135](https://github.com/Snazzah/duck-duck-scrape/issues/135))
## [2.2.4] - 2023-05-11
### Fixed:
- Updated VQD fetching
## [2.2.3] - 2023-02-14
### Fixed:
- Fixed build of last release
## [2.2.2] - 2023-02-14
### Fixed:
- Updated VQD fetching
## [2.2.1] - 2022-02-02
### Fixed:
- Improved web safe search filter ([#33](https://github.com/Snazzah/duck-duck-scrape/issues/33))
## [2.2.0] - 2021-10-26
### Added:
- [Thesaurus spice](https://duck-duck-scrape.js.org/modules.html#thesaurus)
- [Emojipedia spice](https://duck-duck-scrape.js.org/modules.html#emojipedia)
- [Statista spice](https://duck-duck-scrape.js.org/modules.html#statista)
- [ExpandUrl spice](https://duck-duck-scrape.js.org/modules.html#expandUrl)
## [2.1.5] - 2021-09-29
### Fixed:
- Fixed `searchImages` to use ensureJSON
## [2.1.4] - 2021-09-15
### Fixed:
- Fixed typings for forecast spice API
## [2.1.3] - 2021-09-13
### Fixed:
- Search news and videos sanity checking
## [2.1.2] - 2021-08-08
### Fixed:
- License filter in searchImages is now being properly used
## [2.1.1] - 2021-08-07
### Fixed:
- Fixed `noResults` being incorrect in images/news/videos
## [2.1.0] - 2021-06-03
### Added:
- [DNS spice](https://duck-duck-scrape.js.org/modules.html#dns)
### Fixed:
- SearchTimeType is now exported to index
## [2.0.1] - 2021-04-29
### Fixed:
- Fixed no results parsing in `search()`
## [2.0.0] - 2021-04-19
Complete rewrite of the package, read the [documentation](https://duck-duck-scrape.js.org/) before updating.
### Added:
- Type definitions
- Filters within searches (i.e. license, time range, etc.)
### Changed:
- Uses JS endpoints rather than scraping webpages
## [1.0.3] - 2018-04-07
- Initial(-ish) release.

[Unreleased]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.2.5...HEAD
[1.0.3]: https://github.com/Snazzah/duck-duck-scrape/releases/tag/v1.0.3
[2.0.0]: https://github.com/Snazzah/duck-duck-scrape/compare/v1.0.3...v2.0.0
[2.0.1]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.0.0...v2.0.1
[2.1.0]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.0.0...v2.1.0
[2.1.1]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.1.0...v2.1.1
[2.1.2]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.1.0...v2.1.2
[2.1.3]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.1.2...v2.1.3
[2.1.4]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.1.3...v2.1.4
[2.1.5]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.1.4...v2.1.5
[2.2.0]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.1.5...v2.2.0
[2.2.1]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.2.0...v2.2.1
[2.2.2]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.2.0...v2.2.2
[2.2.3]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.2.2...v2.2.3
[2.2.4]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.2.3...v2.2.4
[2.2.5]: https://github.com/Snazzah/duck-duck-scrape/compare/v2.2.4...v2.2.5
