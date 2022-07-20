// standalone mode, this will generate font with css prefix as is

const {
  FaFreeProvider,
  MdiProvider,
  BiProvider,
  MiProvider,
} = require('./index');

const outputDir = './output-standalone';

const mdi = new MdiProvider(['plus']);

mdi.makeFonts(outputDir);

const fa = new FaFreeProvider(
  [
    // 'icon-does-not-exists',
    'clock',
    'a',
    // '500px',
    'plus',
    // '__all__',
    'circle',
  ]
  // { loggerOptions: { level: 'debug' } }
);

fa.makeFonts(outputDir);

const bi = new BiProvider([
  // '__all__',
  'xbox',
]);

bi.makeFonts(outputDir);

const mi = new MiProvider(
  [
    // 'abc',
    // '__all__',
    // 'workspaces',
    // 'alarm-on',
    // 'notification-important',
    'add-circle',
  ],
  { formats: ['ttf', 'woff2'], cssChoices: [] }
);

mi.makeFonts(outputDir);
