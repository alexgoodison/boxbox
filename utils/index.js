const { GeoJSON2SVG } = require("geojson2svg");
const fs = require("fs");
const path = require("path");

(async () => {
  const converter = new GeoJSON2SVG({
    viewportSize: { width: 1600, height: 900 },
    r: 2,
  });

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

      // Generate a track name from the location property
      const trackName = data.features[0].properties.Location.split(" ").join("");

      // Convert GeoJSON to SVG string
      const svgStr = converter.convert(data);

      // Create the React component string
      const componentFile = `const ${trackName} = ({ strokeWidth = 7, strokeColor = "white", ...props }) => {
  return (
    <svg
      viewBox="0 0 1600 900"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}>
    ${svgStr.join("\n")}
    </svg>
  );
};

export default ${trackName};`;

      // Write the React component file to the output folder
      const componentFilePath = path.join(outputFolder, `${trackName}.tsx`);
      await fs.writeFileSync(componentFilePath, componentFile, "utf-8");

      console.log(`Generated ${trackName}.tsx`);
    }
  }
})();
