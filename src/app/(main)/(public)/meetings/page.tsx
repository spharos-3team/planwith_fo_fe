import { redirect } from "next/navigation";

export default function LegacyMeetingsRoutePage() {
  redirect("/community/meeting");
}
