import Track from "@/components/Track";
import Image from "next/image";
import { promises as fs } from "fs";

export default async function Home() {
  /* const trackFile = await fs.readFile(
    process.cwd() + "/src/data/circuits/it-1922.geojson",
    "utf8"
  );

  const trackGeojson = JSON.parse(trackFile);*/

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center max-w-5xl mx-auto">
        <Track />
      </main>
    </div>
  );
}
