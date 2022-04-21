import { getGithubUserContribution } from "@snk/github-user-contribution";
import { userContributionToGrid } from "./userContributionToGrid";
import { getBestRoute } from "@snk/solver/getBestRoute";
import { snake4 } from "@snk/types/__fixtures__/snake";
import { getPathToPose } from "@snk/solver/getPathToPose";
import type { DrawOptions as DrawOptions } from "@snk/svg-creator";
import type { AnimationOptions } from "@snk/gif-creator";

export const generateContributionSnake = async (
  userName: string,
  outputs: ({
    format: "svg" | "gif";
    drawOptions: DrawOptions;
    animationOptions: AnimationOptions;
  } | null)[]
) => {
  console.log("🎣 fetching github user contribution");
  const { cells, colorScheme } = await getGithubUserContribution(userName);

  const grid = userContributionToGrid(cells, colorScheme);
  const snake = snake4;

  console.log("📡 computing best route");
  const chain = getBestRoute(grid, snake)!;
  chain.push(...getPathToPose(chain.slice(-1)[0], snake)!);

  return Promise.all(
    outputs.map(async (out, i) => {
      if (!out) return;
      const { format, drawOptions, animationOptions } = out;

      if (format === "svg" && !process.env.SNK_DISABLE_SVG) {
        console.log(`🖌 creating svg (outputs[${i}])`);
        const { createSvg } = await import("@snk/svg-creator");
        return createSvg(grid, cells, chain, drawOptions, animationOptions);
      }
      if (format === "gif" && !process.env.SNK_DISABLE_GIF) {
        console.log(`📹 creating gif (outputs[${i}])`);
        const { createGif } = await import("@snk/gif-creator");
        return await createGif(
          grid,
          cells,
          chain,
          drawOptions,
          animationOptions
        );
      }
    })
  );
};
