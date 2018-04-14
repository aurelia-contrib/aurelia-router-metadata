import ts from "rollup-plugin-typescript2";
import resolve from "rollup-plugin-node-resolve";
import commonJS from "rollup-plugin-commonjs";

function output(config, format, opts = {}) {
  return {
    input: "src/aurelia-router-metadata.ts",
    output: { ...{ file: `dist/${config}/aurelia-router-metadata.js`, format }, ...opts },
    plugins: [
      resolve(),
      commonJS({
        include: "node_modules/**"
      }),
      ts({
        tsconfig: `configs/tsconfig-build-${config}.json`,
        tsconfigOverride: {
          compilerOptions: {
            module: "ES2015"
          }
        },
        cacheRoot: ".rollupcache"
      })
    ],
    external: [
      "aurelia-dependency-injection",
      "aurelia-loader",
      "aurelia-logging",
      "aurelia-pal",
      "aurelia-router"
    ]
  };
}

const outputs = [
  output("amd", "amd", { amd: { id: "aurelia-router-metadata" } }),
  output("commonjs", "cjs"),
  output("es2017", "es"),
  output("es2015", "es"),
  output("native-modules", "es"),
  output("system", "system")
];

export default outputs;
