const iconFontSubset = require("./dist").default;
const { MdiProvider, FaFreeProvider, MiProvider } = require("./dist");

const mdi = new MdiProvider(
  [
    "account-circle",
    "plus",
    "trash-can",
    "format-rotate-90",
    "upload",
    "reload",
    "close",
    "sync",
    "crop-rotate",
    // "__all__",
    // "cancel",
  ],
  {}
);

const fa = new FaFreeProvider(
  [
    "icon-does-not-exists",
    "clock",
    "a",
    "500px",
    "plus",
    // "__all__",
    // "circle"
  ]
  // { loggerOptions: { level: "debug" } }
);

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

// combine mode, mdi and fa icons will use ss as css prefix.
iconFontSubset([fa, mi, mdi], "./output", {
  formats: ["woff2", "ttf"],
  // resetUnicode: true
  // loggerOptions: {level: "debug"}
});
