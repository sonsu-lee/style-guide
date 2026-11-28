interface CacheEntry {
  data: string;
}

interface User {
  id: string;
}

interface CacheSchema {
  catch(fallback: () => undefined): CacheSchema;
}

declare function warmCache(region: string): Promise<string>;
declare function markWarm(region: string): void;
declare function reportWarmupFailure(error: unknown): void;
declare function readCache(key: string): Promise<CacheEntry>;
declare function loadFromDatabase(key: string): Promise<CacheEntry>;
declare function findUser(id: string): Promise<User>;

export async function publishWarmRegion(region: string): Promise<void> {
  // expect: error sonsu-lee-eslint/no-ignored-rejection -- A failed warmup is treated as a ready region.
  await warmCache(region).catch(() => {});
  markWarm(region);
}

export function warmWithoutWaiting(region: string): void {
  // expect: error sonsu-lee-eslint/no-ignored-rejection -- Nothing reads the fallback or reports the warmup failure.
  warmCache(region).catch(() => undefined);
}

export async function warmAllRegions(regions: string[]): Promise<void> {
  // expect: error sonsu-lee-eslint/no-ignored-rejection -- The batch succeeds even when an individual warmup fails.
  await Promise.all(regions.map((region) => warmCache(region).catch(() => {})));
}

export function publishAfterWarmup(region: string): void {
  // expect: error sonsu-lee-eslint/no-ignored-rejection -- The rejection branch neither marks the region ready nor reports why.
  warmCache(region).then(markWarm, () => {});
}

export async function loadEntry(key: string): Promise<CacheEntry> {
  const cached = await readCache(key).catch(() => undefined);
  return cached ?? loadFromDatabase(key);
}

export function getCachedUser(id: string): Promise<User | null> {
  return findUser(id).catch(() => null);
}

export function queueRegionWarmup(region: string): void {
  warmCache(region).catch(reportWarmupFailure);
}

export async function refreshUser(id: string): Promise<void> {
  // expect: error sonsu-lee-eslint/no-ignored-rejection -- The assertion hides a fallback that nothing reads.
  await findUser(id).catch(() => null as User | null);
}

export function optionalCacheSchema(schema: CacheSchema): CacheSchema {
  return schema.catch(() => undefined);
}
