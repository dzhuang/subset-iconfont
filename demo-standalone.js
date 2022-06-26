// standalone mode, this will generate font with css prefix as is

const {
  FaFreeProvider,
  MdiProvider,
  BiProvider,
  MiProvider,
} = require("./dist");

const mdi = new MdiProvider(["plus"]);

mdi.makeFonts("./output-standalone");

const fa = new FaFreeProvider(
  [
    // "icon-does-not-exists",
    "clock",
    "a",
    // // "500px",
    "plus",
    // "__all__",
    "circle",
  ]
  // { loggerOptions: { level: "debug" } }
);

fa.makeFonts("./output-standalone");

const bi = new BiProvider([
  "xbox",
  // "__all__"
]);

bi.makeFonts("./output-standalone");

const mi = new MiProvider(
  [
    // "abc",
    // "__all__",
    // "workspaces",
    // "alarm-on",
    // "notification-important"
    "add-circle",
  ],
  { formats: ["ttf", "woff2"] }
);

mi.makeFonts("./output-standalone");
