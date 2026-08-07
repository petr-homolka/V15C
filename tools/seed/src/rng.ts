/**
 * Deterministický generátor. Stejné semínko = stejná data.
 *
 * Proč ne Math.random(): testovací data se musí dát znovu vytvořit ve stejné
 * podobě, jinak se nedá reprodukovat chyba, kterou někdo viděl. Jiné semínko
 * dá jinou sadu, když je potřeba čerstvá.
 */

export class Rng {
  private state: number

  constructor(seed: string) {
    // FNV-1a — stačí a je krátký
    let h = 0x811c9dc5
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 0x01000193)
    }
    this.state = h >>> 0 || 1
  }

  /** xorshift32 — rychlý, deterministický, pro testovací data dost dobrý. */
  next(): number {
    let x = this.state
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    this.state = x >>> 0
    return this.state / 0x100000000
  }

  /** Celé číslo v <min, max>. */
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1))
  }

  pick<T>(items: readonly T[]): T {
    if (items.length === 0) throw new Error('pick z prázdného seznamu')
    return items[Math.floor(this.next() * items.length)]!
  }

  /** N různých prvků. Když je jich méně než N, vrátí kolik má. */
  sample<T>(items: readonly T[], n: number): T[] {
    const pool = [...items]
    const out: T[] = []
    while (out.length < n && pool.length > 0) {
      out.push(pool.splice(Math.floor(this.next() * pool.length), 1)[0]!)
    }
    return out
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability
  }

  /** Datum mezi dvěma daty, po dnech. */
  dateBetween(from: Date, to: Date): Date {
    const span = to.getTime() - from.getTime()
    const day = 86_400_000
    const days = Math.floor(span / day)
    return new Date(from.getTime() + this.int(0, days) * day)
  }
}

/** 'YYYY-MM-DD' — lhůty se počítají v kalendářních dnech (schema/common.ts). */
export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function isoDateTime(d: Date): string {
  return d.toISOString()
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86_400_000)
}

export function addMonths(d: Date, months: number): Date {
  const out = new Date(d)
  out.setMonth(out.getMonth() + months)
  return out
}
