import { redirect } from "next/navigation";

export default function LegacyNewMeetingRoutePage() {
  redirect("/community/meeting/new");
}
