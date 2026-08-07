#!/usr/bin/env node
/**
 * CLI pro testovací data.
 *
 *   npm run seed              nahraje sadu
 *   npm run seed -- clear     smaže VŠECHNA testovací data
 *   npm run seed -- reseed    smaže a nahraje znovu
 *   npm run seed -- stats     spočítá, co v databázi je
 *   npm run seed -- dump      vypíše sadu do JSON, bez zápisu do databáze
 *
 * Volby: --seed=xyz  --orgs=2  --max-agreements=19  --today=2026-08-07
 *        --project=demo-v15c  --force  (povinné mimo emulátor)
 *
 * BEZPEČNOSTNÍ ZÁMEK: skript odmítne běžet proti skutečnému projektu, pokud
 * není nastavené FIRESTORE_EMULATOR_HOST nebo předané --force. Testovací data
 * v produkci by byla horší než žádná — nedají se rozeznat od pravých.
 *
 * MAZÁNÍ: v systému se nikdy nic nemaže (dok. 10) a pravidla to nepovolují
 * NIKOMU. Tenhle skript maže přes Admin SDK, který pravidla obchází, a maže
 * VÝHRADNĚ dokumenty se značkou `demo: true`. Na skutečná data nemá jak
 * dosáhnout — a to pravidlo tím zůstává celé.
 */

import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { writeFileSync } from 'node:fs'
import { PLATFORM_ROOT } from '../../../schema/src/index'
import { DEFAULT_OPTIONS, build, type SeedDoc } from './build'

type Command = 'seed' | 'clear' | 'reseed' | 'stats' | 'dump'

interface Flags {
  command: Command
  seed: string
  orgs: number
  maxAgreements: number
  today: Date
  projectId: string
  force: boolean
  out: string
}

function parseFlags(argv: string[]): Flags {
  const positional = argv.filter((a) => !a.startsWith('--'))
  const flag = (name: string): string | undefined =>
    argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=')

  const command = (positional[0] ?? 'seed') as Command
  if (!['seed', 'clear', 'reseed', 'stats', 'dump'].includes(command)) {
    throw new Error(`Neznámý příkaz: ${command}`)
  }

  return {
    command,
    seed: flag('seed') ?? DEFAULT_OPTIONS.seed,
    orgs: Number(flag('orgs') ?? DEFAULT_OPTIONS.organizations),
    maxAgreements: Number(flag('max-agreements') ?? DEFAULT_OPTIONS.maxAgreementsPerKeyWorker),
    today: new Date(flag('today') ?? DEFAULT_OPTIONS.today.toISOString()),
    projectId: flag('project') ?? process.env.GCLOUD_PROJECT ?? 'demo-v15c',
    force: argv.includes('--force'),
    out: flag('out') ?? 'demo-data.json',
  }
}

function connect(flags: Flags): Firestore {
  const emulator = process.env.FIRESTORE_EMULATOR_HOST
  if (!emulator && !flags.force) {
    console.error(
      'ODMÍTNUTO: není nastavené FIRESTORE_EMULATOR_HOST.\n' +
      'Testovací data patří do emulátoru. Pro skutečný projekt přidej --force\n' +
      'a měj jistotu, že v něm nejsou pravá data.',
    )
    process.exit(2)
  }
  if (emulator) console.log(`Emulátor: ${emulator}`)
  else console.log(`!! SKUTEČNÝ PROJEKT: ${flags.projectId} (--force)`)

  const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
  initializeApp(
    emulator
      ? { projectId: flags.projectId }
      : credential
        ? { projectId: flags.projectId, credential: cert(credential) }
        : { projectId: flags.projectId },
  )
  return getFirestore()
}

/** Zápis po dávkách. Firestore bere max 500 operací na dávku. */
async function writeAll(db: Firestore, docs: SeedDoc[]): Promise<void> {
  const CHUNK = 400
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = db.batch()
    for (const doc of docs.slice(i, i + CHUNK)) {
      batch.set(db.doc(doc.path), doc.data)
    }
    await batch.commit()
    process.stdout.write(`\r  zapsáno ${Math.min(i + CHUNK, docs.length)} / ${docs.length}`)
  }
  process.stdout.write('\n')
}

/**
 * Smaže jen to, co má značku. Prochází se rekurzivně od organizací
 * `demo-org-*`, protože značka je na dokumentech, ne v cestě, a dotaz
 * napříč kolekcemi by musel mít index pro každou z nich.
 */
async function clearDemo(db: Firestore): Promise<number> {
  let deleted = 0

  const deleteRecursive = async (path: string): Promise<void> => {
    const ref = db.doc(path)
    const snap = await ref.get()
    for (const sub of await ref.listCollections()) {
      const docs = await sub.listDocuments()
      for (const d of docs) await deleteRecursive(d.path)
    }
    if (snap.exists) {
      if (snap.get('demo') !== true) {
        console.warn(`  přeskočeno (není demo): ${path}`)
        return
      }
      await ref.delete()
      deleted++
      if (deleted % 200 === 0) process.stdout.write(`\r  smazáno ${deleted}`)
    }
  }

  // Organizace se poznají PODLE ZNAČKY, ne podle id. Id jsou od té doby,
  // co se generují skutečná UID (uid.ts), náhodná šestimístná — hledat
  // podle prefixu by nenašlo nic a `clear` by mlčky nechal data ležet.
  // (Tuhle chybu odhalilo právě to, že testovací data přestala mít
  // čitelná id.)
  const orgs = await db.collection('orgs').listDocuments()
  for (const orgRef of orgs) {
    const snap = await orgRef.get()
    if (snap.get('demo') !== true) continue
    await deleteRecursive(orgRef.path)
  }

  // Platformní číselníky taky — jinak by „smaž vše“ nebylo pravda. Značka
  // `demo: true` je i na nich, takže se nic cizího dotknout nemůže.
  await deleteRecursive(PLATFORM_ROOT)

  // Marketplace žije v kořenových kolekcích, ne pod organizací
  // (marketplace.ts). Bez tohohle by po `clear` zůstali pořadatelé,
  // nabídka a certifikáty — a „smazáno vše“ by byla nepravda.
  for (const collection of [
    'entities', 'providers', 'listings', 'orders',
    'certificates', 'confirmations', 'verifications',
  ]) {
    for (const ref of await db.collection(collection).listDocuments()) {
      await deleteRecursive(ref.path)
    }
  }

  if (deleted > 0) process.stdout.write(`\r  smazáno ${deleted}\n`)
  return deleted
}

async function stats(db: Firestore): Promise<void> {
  const orgs = await db.collection('orgs').listDocuments()
  const demoOrgs: Array<{ ref: (typeof orgs)[number]; name: string }> = []
  for (const ref of orgs) {
    const snap = await ref.get()
    if (snap.get('demo') === true) {
      demoOrgs.push({ ref, name: String(snap.get('displayName') ?? '?') })
    }
  }
  console.log(`Testovací organizace: ${demoOrgs.length}`)

  for (const { ref: orgRef, name } of demoOrgs) {
    console.log(`\n  ${orgRef.id} — ${name}`)
    for (const col of ['members', 'persons', 'children', 'agreements', 'caseFiles',
                       'obligations', 'tasks', 'events', 'inquiries', 'submissions']) {
      const count = (await orgRef.collection(col).count().get()).data().count
      if (count > 0) console.log(`    ${col.padEnd(16)} ${count}`)
    }
  }
}

/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2))

  if (flags.command === 'dump') {
    const result = build({
      seed: flags.seed,
      organizations: flags.orgs,
      maxAgreementsPerKeyWorker: flags.maxAgreements,
      today: flags.today,
    })
    writeFileSync(flags.out, JSON.stringify(result, null, 2))
    console.log(`Zapsáno ${result.docs.length} dokumentů do ${flags.out}`)
    console.table(result.stats)
    return
  }

  const db = connect(flags)

  if (flags.command === 'clear' || flags.command === 'reseed') {
    console.log('Mažu testovací data…')
    const n = await clearDemo(db)
    console.log(`Smazáno ${n} dokumentů.`)
    if (flags.command === 'clear') return
  }

  if (flags.command === 'stats') {
    await stats(db)
    return
  }

  const result = build({
    seed: flags.seed,
    organizations: flags.orgs,
    maxAgreementsPerKeyWorker: flags.maxAgreements,
    today: flags.today,
  })
  console.log(`Sada „${result.batchId}“ — ${result.docs.length} dokumentů:`)
  console.table(result.stats)
  await writeAll(db, result.docs)
  console.log('Hotovo. Přehled: npm run seed -- stats')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
