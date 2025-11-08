import { TooltipProvider } from "@/components/ui/tooltip"; // if shared via universal
import ErrorBoundary from "../components/ErrorBoundary"; // Assuming components is at the root of the project for now, will adjust path if needed
import { FeatureProvider } from "../src/providers/FeatureProvider";
import App from "./App"; // Expo Router App

// The original App_1.tsx content is being adapted to this Root component
// to wrap the main Expo Router App with necessary providers.

export default function Root() {
  return (
    <ErrorBoundary>
      <FeatureProvider>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </FeatureProvider>
    </ErrorBoundary>
  );
}
