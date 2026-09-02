import { extractIntent } from "./llmClient.service";
import { validateIntent } from "../validators/nlSearch.validator";
import { getRecommendations } from "./recommendation.service";

export async function searchByNaturalLanguage(query: string, lat?: number, lng?: number) {
  const rawIntent = await extractIntent(query);
  const validated = await validateIntent(rawIntent);

  if (!validated.serviceName) {
    // We couldn't confidently resolve a real service — return empty results
    // with a clear explanation, rather than guessing or running an unfiltered search.
    return {
      interpretedAs: {
        serviceName: null,
        maxWaitMinutes: validated.maxWaitMinutes,
        note: rawIntent?.note || "Could not determine which service you're looking for.",
      },
      results: [],
    };
  }

  // Reuse Phase 13's EXISTING, UNMODIFIED recommendation search — this is the
  // "backend enforces normal business logic" step. Nothing about how results
  // are found or ranked changes based on how the query arrived.
  let results = await getRecommendations({ serviceName: validated.serviceName, lat, lng });

  if (validated.maxWaitMinutes !== null) {
    results = results.filter((r) => r.estimatedWaitMinutes <= validated.maxWaitMinutes!);
  }

  return {
    interpretedAs: {
      serviceName: validated.serviceName,
      maxWaitMinutes: validated.maxWaitMinutes,
      note: rawIntent?.note || `Searching for ${validated.serviceName}.`,
    },
    results,
  };
}