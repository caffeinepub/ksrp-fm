import { Ed25519KeyIdentity } from "@dfinity/identity";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { backendInterface } from "../backend";
import { createActorWithConfig } from "../config";
import { getSecretParameter } from "../utils/urlParams";
import { useInternetIdentity } from "./useInternetIdentity";

const LOCAL_IDENTITY_KEY = "ksrp_local_identity";

/**
 * Returns a persistent Ed25519 identity stored in localStorage.
 * This gives each browser session a stable, non-anonymous principal
 * so that backend role assignments (e.g. activateAdminWithCode) work
 * even when the user hasn't logged in via Internet Identity.
 */
function getOrCreateLocalIdentity(): Ed25519KeyIdentity {
  try {
    const stored = localStorage.getItem(LOCAL_IDENTITY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return Ed25519KeyIdentity.fromJSON(JSON.stringify(parsed));
    }
  } catch {
    // corrupted — regenerate
  }
  const identity = Ed25519KeyIdentity.generate();
  localStorage.setItem(LOCAL_IDENTITY_KEY, JSON.stringify(identity.toJSON()));
  return identity;
}

const ACTOR_QUERY_KEY = "actor";
export function useActor() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const actorQuery = useQuery<backendInterface>({
    queryKey: [ACTOR_QUERY_KEY, identity?.getPrincipal().toString()],
    queryFn: async () => {
      // Use Internet Identity if available; otherwise fall back to a
      // persistent local identity so backend calls are never anonymous.
      const activeIdentity = identity ?? getOrCreateLocalIdentity();

      const actorOptions = {
        agentOptions: {
          identity: activeIdentity,
        },
      };

      const actor = await createActorWithConfig(actorOptions);
      const adminToken = getSecretParameter("caffeineAdminToken") || "";
      await actor._initializeAccessControlWithSecret(adminToken);
      return actor;
    },
    staleTime: Number.POSITIVE_INFINITY,
    enabled: true,
  });

  // When the actor changes, invalidate dependent queries
  useEffect(() => {
    if (actorQuery.data) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
      queryClient.refetchQueries({
        predicate: (query) => {
          return !query.queryKey.includes(ACTOR_QUERY_KEY);
        },
      });
    }
  }, [actorQuery.data, queryClient]);

  return {
    actor: actorQuery.data || null,
    isFetching: actorQuery.isFetching,
  };
}
