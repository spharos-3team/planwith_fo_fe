import { BookOpen } from "lucide-react";

import { StatusMessage } from "@/components/common/StatusMessage";

export function StoryGrid({ message }: { message: string }) {
  return (
    <div className="w-full">
      <StatusMessage>
        <BookOpen
          aria-hidden="true"
          className="mx-auto mb-3 size-6 text-brand-primary"
        />
        {message}
      </StatusMessage>
    </div>
  );
}
