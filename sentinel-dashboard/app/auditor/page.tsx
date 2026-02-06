import { Suspense } from "react";
import AuditorPage from "./AuditorClient";

export default function AuditorPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-white">Loading...</div></div>}>
      <AuditorPage />
    </Suspense>
  );
}
