import { ScheduleLayout } from "@/components/common/layout/ScheduleLayout";
import { DestinationHero } from "@/features/home/components/DestinationHero";

export default function Home() {
  return (
    <ScheduleLayout authenticated={false} headerVariant="overlay">
      <DestinationHero />
    </ScheduleLayout>
  );
}
