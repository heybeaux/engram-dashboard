import { Waypoints } from "lucide-react";
import { ArcSearchView } from "./_components/arc-search-view";

export const metadata = {
  title: "Timelines / Arcs",
};

export default function TimelinesPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <Waypoints className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold md:text-3xl">Timelines / Arcs</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Search your work arcs semantically or by date, then read the arc&apos;s
          days at your chosen level of detail.
        </p>
      </div>

      <ArcSearchView />
    </div>
  );
}
