import { getSavedEvents } from "@/actions/saved";
import { SavedEventsClient } from "@/components/dashboard/SavedEventsClient";

export default async function SavedEventsPage() {
  const saved = await getSavedEvents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-archivo)]">
          Saved Events
        </h1>
        <p className="text-text-faint mt-1">
          Events you&apos;ve bookmarked for later. {saved.length} saved.
        </p>
      </div>

      <SavedEventsClient events={saved} />
    </div>
  );
}
