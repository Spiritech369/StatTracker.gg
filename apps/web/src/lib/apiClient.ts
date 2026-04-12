import type { ChampionDirectoryResponse, RiotProfileResponse } from "../types/api";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:4010";

export type WebChampionDirectory = ChampionDirectoryResponse;
export type WebChampionSummary = ChampionDirectoryResponse["champions"][number];
export type WebRiotProfile = RiotProfileResponse;

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;
    try {
      const payload = await response.json();
      if (payload && typeof payload.error === "string") {
        message = payload.error;
      }
    } catch {
      // Ignore non-JSON bodies and use the fallback message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getChampionDirectory() {
  return apiGet<ChampionDirectoryResponse>("/api/v1/lol/champions");
}

export async function lookupRiotProfileByRiotId(riotId: string) {
  const [gameName, tagLine] = riotId.split("#");
  if (!gameName || !tagLine) {
    throw new Error("Use Riot ID format like gameName#tagLine.");
  }

  return apiGet<RiotProfileResponse>(
    `/api/v1/profiles/riot/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
  );
}

export function getChampionImageUrl(patch: string, imageFull: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${patch}/img/champion/${imageFull}`;
}
