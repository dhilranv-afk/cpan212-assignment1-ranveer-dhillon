
export class TtlCache {
  constructor(ttlSeconds) {
    this.ttlMs = ttlSeconds * 1000;
    this.ttlSeconds = ttlSeconds;
    this.store = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    const entry = this.store.get(key);

    if (!entry || entry.expiresAt <= Date.now()) {
      if (entry) {
        this.store.delete(key);
      }

      this.misses += 1;
      return undefined;
    }

    this.hits += 1;
    return entry.value;
  }

  set(key, value) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  stats() {
    const now = Date.now();

    // Remove expired entries so entries only counts valid cache records.
    for (const [key, entry] of this.store) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
      }
    }

    return {
      entries: this.store.size,
      hits: this.hits,
      misses: this.misses,
      ttlSeconds: this.ttlSeconds,
    };
  }
}
