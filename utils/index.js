const { GeoJSON2SVG } = require("geojson2svg");
const fs = require("fs");
const path = require("path");

(async () => {
  const circuitsFolder = "./circuits"; // Path to your circuits folder
  const outputFolder = "../frontend/src/components/tracks"; // Output folder for React components

  // Read all files in the circuits folder
  const files = fs.readdirSync(circuitsFolder);

  // Process each .geojson file
  for (const file of files) {
    if (path.extname(file) === ".geojson") {
      // Read and parse the GeoJSON file
      const filePath = path.join(circuitsFolder, file);
      const fileContent = await fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(fileContent);
      const bbox = data.bbox;

      // Calculate the center of the bbox
      const centerX = (bbox[0] + bbox[2]) / 2;
      const centerY = (bbox[1] + bbox[3]) / 2;

      // Set padding (you can adjust this value as needed)
      const padding = 0.0004; // Padding around the bbox (in degrees)

      // Calculate the width and height of the bbox
      const bboxWidth = bbox[2] - bbox[0];
      const bboxHeight = bbox[3] - bbox[1];

      // Calculate the scale factor to fit the bbox within the SVG
      const scaleX = 1600 / bboxWidth;
      const scaleY = 900 / bboxHeight;

      // Use the smaller scale factor to ensure the entire bbox fits within the map
      const scale = Math.min(scaleX, scaleY);

      // Apply the padding to the bbox and center it
      const paddedBbox = {
        left: centerX - 1600 / scale / 2 - padding,
        bottom: centerY - 900 / scale / 2 - padding,
        right: centerX + 1600 / scale / 2 + padding,
        top: centerY + 900 / scale / 2 + padding,
      };

      const converter = new GeoJSON2SVG({
        mapExtent: paddedBbox,
        viewportSize: { width: 1600, height: 900 },
        r: 1,
        attributes: { id: "trackPath" },
      });

      // Generate a track name from the location property
      const trackName = data.features[0].properties.Location.split(" ").join("");

      // Convert GeoJSON to SVG string
      let svgStr = converter.convert(data);
      svgStr = svgStr.join("\n");
      svgStr = svgStr.replace(`id="trackPath"`, `\nid="trackPath" ref={ref}\n`);

      // Create the React component string
      const componentFile = `import { forwardRef } from "react";

const ${trackName} = forwardRef<SVGPathElement>((_, ref) => (
  ${svgStr}
));

export default ${trackName};`;

      // Write the React component file to the output folder
      const componentFilePath = path.join(outputFolder, `${trackName}.tsx`);
      await fs.writeFileSync(componentFilePath, componentFile, "utf-8");

      console.log(`Generated ${trackName}.tsx`);
    }
  }
})();
