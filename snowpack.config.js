/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: {
    // Main sources should not be in the directory that node_modules is in
    src: "/",
    assets: { url: "/assets", static: true, resolve: false },
  },
  plugins: [
    [
      "@snowpack/plugin-run-script",
      {
        cmd: "node build-asset-list.js",
        watch: "node build-asset-list.js",
      }
    ]
  ],
  packageOptions: {},
  devOptions: {},
  buildOptions: {},
};
