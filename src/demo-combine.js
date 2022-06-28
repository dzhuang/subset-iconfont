const { subsetIconfont } = require('./index');
const {
  MdiProvider,
  FaFreeProvider,
  MiProvider,
  BiProvider,
} = require('./index');

const mdi = new MdiProvider(
  [
    'account-circle',
    'plus',
    'trash-can',
    'format-rotate-90',
    'upload',
    'reload',
    'close',
    'sync',
    'crop-rotate',
    'cancel',
    // '__all__',
  ],
  {}
);

const fa = new FaFreeProvider(
  [
    // 'icon-does-not-exists',
    'clock',
    'a',
    '500px',
    'plus',
    // '__all__',
    // 'circle'
  ]
  // { loggerOptions: { level: 'debug' } }
);

const mi = new MiProvider(
  [
    'abc',
    // '__all__',
    // 'workspaces',
    // 'alarm-on',
    // 'notification-important'
    // 'add-circle',
  ],
  { formats: ['ttf', 'woff2'] }
);

const bi = new BiProvider(['plus'], { formats: ['ttf', 'woff2'] });

// combine mode, mdi and fa icons will use ss as css prefix.
subsetIconfont([fa, mi, mdi, bi], './output', {
  formats: ['woff2', 'ttf'],
  // loggerOptions: {level: 'debug'}
}).then((result) => {
  console.log(result);
});
