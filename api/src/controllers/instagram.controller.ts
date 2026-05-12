import type { FastifyReply } from "fastify";
import { env } from "../config/env.js";

type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
};

type InstagramMediaResponse = {
  data?: InstagramMediaItem[];
  error?: {
    message?: string;
  };
};

const instagramMediaFields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
const instagramCacheTtlMs = 5 * 60 * 1000;

/** Se `id` for de uma Página do Facebook, devolve o id da conta Instagram ligada; senão devolve o próprio id (IGBA). */
async function resolveInstagramMediaOwnerId(graphNodeId: string, accessToken: string): Promise<string> {
  const probeUrl = new URL(`https://graph.facebook.com/v20.0/${encodeURIComponent(graphNodeId)}`);
  probeUrl.searchParams.set("fields", "instagram_business_account{id},connected_instagram_account{id}");
  probeUrl.searchParams.set("access_token", accessToken);

  const probeRes = await fetch(probeUrl);
  const probePayload = (await probeRes.json()) as {
    instagram_business_account?: { id?: string };
    connected_instagram_account?: { id?: string };
    error?: { message?: string };
  };

  let nestedId =
    probePayload.instagram_business_account?.id ?? probePayload.connected_instagram_account?.id;

  if (nestedId) {
    return nestedId;
  }

  const accountsUrl = new URL("https://graph.facebook.com/v20.0/me/accounts");
  accountsUrl.searchParams.set(
    "fields",
    "id,instagram_business_account{id},connected_instagram_account{id}",
  );
  accountsUrl.searchParams.set("limit", "50");
  accountsUrl.searchParams.set("access_token", accessToken);

  const accRes = await fetch(accountsUrl);
  const accPayload = (await accRes.json()) as {
    data?: Array<{
      id?: string;
      instagram_business_account?: { id?: string };
      connected_instagram_account?: { id?: string };
    }>;
    error?: { message?: string };
  };

  const pages = accPayload.data ?? [];
  const configuredPage = pages.find((p) => p.id === graphNodeId);
  nestedId =
    configuredPage?.instagram_business_account?.id ?? configuredPage?.connected_instagram_account?.id;

  if (nestedId) {
    return nestedId;
  }

  const fallbackPage = pages.find(
    (p) => p.instagram_business_account?.id ?? p.connected_instagram_account?.id,
  );
  nestedId =
    fallbackPage?.instagram_business_account?.id ?? fallbackPage?.connected_instagram_account?.id;

  if (nestedId) {
    return nestedId;
  }

  return graphNodeId;
}

let instagramCache:
  | {
      expiresAt: number;
      items: InstagramMediaItem[];
    }
  | undefined;

export async function listInstagramMedia(_request: unknown, reply: FastifyReply) {
  if (!env.INSTAGRAM_ACCESS_TOKEN) {
    return reply.status(503).send({
      items: [],
      message: "Instagram access token is not configured.",
    });
  }

  if (instagramCache && instagramCache.expiresAt > Date.now()) {
    return { items: instagramCache.items };
  }

  let mediaOwnerId: string | undefined;

  if (env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
    mediaOwnerId = await resolveInstagramMediaOwnerId(env.INSTAGRAM_BUSINESS_ACCOUNT_ID, env.INSTAGRAM_ACCESS_TOKEN);
  }

  async function fetchMedia(graphHost: "facebook" | "instagram") {
    const pathId = mediaOwnerId ?? "me";
    const base =
      graphHost === "facebook"
        ? `https://graph.facebook.com/v20.0/${pathId}/media`
        : `https://graph.instagram.com/v20.0/${pathId}/media`;
    const mediaUrl = new URL(base);
    mediaUrl.searchParams.set("fields", instagramMediaFields);
    mediaUrl.searchParams.set("limit", "24");
    mediaUrl.searchParams.set("access_token", env.INSTAGRAM_ACCESS_TOKEN!);

    const mediaRes = await fetch(mediaUrl);
    return {
      response: mediaRes,
      payload: (await mediaRes.json()) as InstagramMediaResponse,
    };
  }

  let { response, payload } = mediaOwnerId
    ? await fetchMedia("facebook")
    : await fetchMedia("instagram");

  const missingMediaEdge =
    payload.error?.message?.includes("nonexisting field (media)") ?? false;

  if ((!response.ok || payload.error) && mediaOwnerId && missingMediaEdge) {
    ({ response, payload } = await fetchMedia("instagram"));
  }

  if (!response.ok || payload.error) {
    return reply.status(502).send({
      items: [],
      message: payload.error?.message ?? "Could not fetch Instagram media.",
    });
  }

  const items = (payload.data ?? [])
    .filter((item) => item.media_type !== "VIDEO" && item.media_url)
    .slice(0, 12);

  instagramCache = {
    expiresAt: Date.now() + instagramCacheTtlMs,
    items,
  };

  return { items };
}
