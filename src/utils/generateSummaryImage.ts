import fs from "fs";
import path from "path";
import sharp from "sharp";
import { Country } from "../types";

async function generateSummaryImage(countries: Country[]) {
  const cacheDir = path.join(process.cwd(), "cache");
  const imagePath = path.join(cacheDir, "summary.png");

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const total = countries.length;
  const top5 = [...countries]
    .sort((a, b) => b.estimated_gdp - a.estimated_gdp)
    .slice(0, 5);

  const textLines = [
    `🌍 Total countries: ${total}`,
    "",
    "💰 Top 5 by GDP:",
    ...top5.map(
      (c, i) => `${i + 1}. ${c.name} — $${c.estimated_gdp.toLocaleString()}`
    ),
    "",
    `🕒 Last refreshed: ${new Date().toLocaleString()}`,
  ];

  const svg = `
  <svg width="600" height="${
    200 + top5.length * 30
  }" xmlns="http://www.w3.org/2000/svg">
    <style>
      .title { font: bold 22px sans-serif; fill: #333; }
      .text { font: 16px monospace; fill: #111; }
    </style>
    <rect width="100%" height="100%" fill="#f9f9f9" rx="10" ry="10"/>
    <text x="20" y="40" class="title">Country Summary</text>
    ${textLines
      .map(
        (line, i) =>
          `<text x="20" y="${80 + i * 25}" class="text">${line}</text>`
      )
      .join("\n")}
  </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(imagePath);

  return imagePath;
}

export default generateSummaryImage;
