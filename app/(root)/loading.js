import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Button variant="secondary" disabled size="lg">
        <Spinner data-icon="inline-start" className="size-lg" />
        Processing
      </Button>
    </div>
  );
}
