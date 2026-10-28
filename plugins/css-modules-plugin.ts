import type { BunPlugin } from "bun";
import lightningcss from "bun-lightningcss";

const lightningcssPlugin = lightningcss();

/**
 * Compiles `.module.css` with bun-lightningcss.
 * Other stylesheets stay on Bun's loader so `url()` assets keep working.
 */
const cssModulesPlugin: BunPlugin = {
  name: "css-modules",
  async setup(build) {
    build.onLoad({ filter: /(?<!\.module)\.css$/ }, async ({ path }) => {
      const contents = await Bun.file(path).text();

      return {
        contents,
        loader: "css",
      };
    });

    await lightningcssPlugin.setup(build);
  },
};

export default cssModulesPlugin;
