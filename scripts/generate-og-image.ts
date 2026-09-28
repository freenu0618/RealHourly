// Keep the static social preview in sync with the original image renderer.
// Run from the repository root: npm run generate:og
import { writeFile } from "node:fs/promises";
import { GET } from "../src/app/api/og/route";

async function main() {
  const response = await GET();
  await writeFile("public/og-image.png", Buffer.from(await response.arrayBuffer()));
  console.log("Generated public/og-image.png (1200 × 630)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
