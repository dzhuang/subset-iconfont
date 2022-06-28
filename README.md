# subset-iconfont

[![NPM version](https://img.shields.io/npm/v/subset-iconfont.svg)](https://www.npmjs.org/package/https://www.npmjs.com/package/subset-iconfont)
[![Node.js CI](https://github.com/dzhuang/subset-iconfont/actions/workflows/ci.yml/badge.svg)](https://github.com/dzhuang/subset-iconfont/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/dzhuang/subset-iconfont/branch/main/graph/badge.svg?token=6ZZN9N1QWH)](https://codecov.io/gh/dzhuang/subset-iconfont)

Subset multiple iconfont packages and generate CSS/SCSS.

## Features

- Subset from multiple iconfont npm packages;
- Supported output font formats: `woff2`, `woff`, `eot`, `ttf`;
- Auto generate font LICENSE files for font used;
- Auto generate FontAwesome styled CSS/SCSS, which means the subset icons can be used like FontAwesome icons, under FontAwesome free license;
- Auto generate metadata of icons used;
- Tested on `linux` and `windows`.

## Installation

```shell
npm install --save-dev subset-iconfont
```

## Basic Usage

Subset from multiple iconfonts, and combine the css/scss files (Combination mode, see Standalone mode below), for example:

```js
// npm install -D @fortawesome/fontawesome-free @mdi/font @mdi/svg

import { subsetIconfont, MdiProvider, FaFreeProvider } from 'subset-iconfont';

const mdi = new MdiProvider(['plus', 'circle', 'check']),
  fa = new FaFreeProvider(['clock', '500px']);

subsetIconfont([mdi, fa], './outputDir', { formats: ['ttf', 'woff2'] }).then(
  (result) => {
    console.log('Done!');
  }
);
```

## Demo

Run

```shell
npm install --save-dev @fortawesome/fontawesome-free @mdi/font @mdi/svg bootstrap-icons material-icons @material-design-icons/svg
npm run demo
```

See results in `output` and `output-standalone` open the `index.html` to see the usage of the generated icons.

## `SubsetProvider`

The process runs on a series of `SubsetProvider` which are constructors for different iconfont to be subset. Available SubsetProviders include:

- `FaFreeProvider`
  - Source: [FontAwesome Free fonts](https://github.com/FortAwesome/Font-Awesome) by @fontawesome
  - License: [Font Awesome Free License](https://fontawesome.com/license/free)
  - Required npm package: `@fortawesome/fontawesome-free`
  - styles: `solid`, `regular`, `brands` allowed by the Fontawesome Free license
- `MdiProvider`
  - Source: [Material Design Icons](https://materialdesignicons.com/) by Austin Andrews
  - License: [MIT license](https://github.com/Templarian/MaterialDesign/blob/master/LICENSE)
  - Required npm packages: `@mdi/font` and `@mdi/svg`
  - Note: many of the icons have a `outline` variant, which will be included in the result when subsetting. For example, `plus-outline` will also included if `plus` is to be subset. We do not use a `outline` style because the variants were assigned different `unicode` values.
- `BiProvider`
  - Source: [Bootstrap Icons](https://icons.getbootstrap.com/) by The Bootstrap Authors
  - License: [MIT license](https://github.com/twbs/icons/blob/main/LICENSE.md)
  - Required npm package: `bootstrap-icons`.
  - styles: `outlined`, `filled`, `rounded`, `sharp` and `two-tone`
- `MiProvider`
  - Source: [Google Material Icons](https://fonts.google.com/icons) npm packages unofficially maintained @marella
  - License: [Apache License version 2.0](https://github.com/marella/material-icons/blob/main/LICENSE)
  - Required npm packages: `material-icons` and `@material-design-icons/svg`

Note: For provider with styles properties, the program will extract all available style of that icon.

Params to create a `ProviderInstance` are:

### `subsetItem[]`

- Type: array of `string`
- Descriptions: the icon names that will be subset from the provider. Non-existing icons will be ignored and warn in the log.
- Note: To extra all the icons available, use `['__all__']` as the `subsetItem[]`.

### `options`

#### `formats`

- Type: `array`,
- Default: `['woff2', 'ttf']`,
- Possible values: `ttf, eot, woff, woff2`,
- Description: Font file formats to generate.

#### `fontName`

- Type: `string`
- Default: the value from the provider.
- Description: The font family name you want to use.

#### `fontFileName`

- Type: `string`
- Default: The value from the provider.
- Description: A string which can be used a file name, which will be used as:
  - The basename of the font file, for provider without multiple styles;
  - The basename of the css file which included all styles and definitions of icons;
  - The major part of the basename of the font-face css file, for provider without multiple styles;
- Note: For providers with multiple styles, the font file name will be the concatenation of
  `cssPrefix` property of the provider, `style` used and `fontWeight` of that style, while the font-face
  file base name will be the concatenation of `cssPrefix` and `style`.

#### `prefix`

- Type: `string`
- Default: The value from the provider.
- Description: The prefix in the css class when using the icon.

#### `webfontDir`

- Type: `string`
- Default: `webfonts`
- Description: The name of the sub-directory which the font files will be written to.

#### `generateMinCss`

- Type: `boolean`
- Default: `true`
- Description: Whether generate a minified css version for each css files generated.

#### `generateCssMap`

- Type: `boolean`
- Default: `true`
- Description: Whether generate a .map file for each css files generated.

#### `LoggerOptions`

- Type: `winston.LoggerOptions`
- Default: `{level: 'warn'}`
- Description: The options of `winston` logger. We implemented a Console transport, but that can be extended. See [winston](https://github.com/winstonjs/winston) for more information.

#### `writeOutFiles`

- Type: `array`
- Default: `[‘webfonts‘, ‘scss‘, ‘css‘, ‘licenses‘, 'web', 'metadata']`
- Description: The categories of files which will be physically written to disk:
  - `webfonts`: The font files generated
  - `scss`: The scss files
  - `css`: The css files
  - `license`: The LICENSE file of the font used
  - `web`: An `index.html` file which presenting all the subset icons in a web page
  - `metadata`: The metadata of all the subset icons

#### `addHashInFontUrl`

- Type: `boolean`
- Default: `true`
- Description: Whether adding font file hash in font face CSS/SCSS file. This is useful to
  update client caching of font files.

## API

### Standalone mode

##### `ProviderInstance.makeFonts(outputDir) => Promise<MakeFontResult>`

By `Standalone`, we mean subset from a `ProviderInstance`.

#### `outputDir`

- Type: `string`
- Description: A path string where the output files are expected to be written to.

For example:

```js
// npm install -D @mdi/font @mdi/svg

import { MdiProvider } from 'subset-iconfont';

const mdi = new MdiProvider(['plus', 'circle', 'check'], {
  formats: ['ttf', 'woff2'],
});

mdi.makeFonts('./outputDir').then((result) => {
  console.log('Done!');
});
```

### Combination mode

##### `subsetIconfont(providerInstance[], outputDir, options) => Promise<MakeFontResult>`

#### `providerInstance[]`

- Type: `array`
- Description: An array of `SubsetProvider` instances

#### `outputDir`

- Type: `string`
- Description: A path string where the output files are expected to be written to.

#### `options`

The `options` for combination mode has the same options as that of the standalone mode, with an extra option
`outputPackages`.

##### `outputPackages`

- Type: `boolean`
- Default: `false`
- Description: Whether output the subset result of each iconfont. If `true`, there will be a `packages` directory
  which contains all the subset results of the combined packages.

If not configured, `fontName` will use `"Subset Iconfont"`, and `prefix` will use `"si"`,
and `fontFileName` will use `"subset-iconfont"`, as default value.

Notice: `fontName`, `prefix` under combination mode will override the options from `SubsetProvider` instances
so that we can use all subset icons in a consistent way irrespective of which icon comes from which provider (package).

## Usage of Icons generate

See generated `index.html` and FontAwesome free [documentation](https://fontawesome.com/docs/web/setup/host-yourself/webfonts) for details

## Roadmap

- Extend the use case beyond commonJS, for example, for `react.js`, and that's why we've prepared the glyph data of each icon;
- More tests;
- Improved docs;
- Better webpage (index.html) presentation, include search and select abilities.

## Contribution

Feel free to contribute under the MIT license.

## Changelog

Check our [Changelog](CHANGELOG.md)

## License

Check our [License](LICENSE)
