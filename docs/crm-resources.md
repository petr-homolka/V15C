# CRM resources on GitHub — multi-tenant

Third survey, after [`routine-co-resources.md`](./routine-co-resources.md) and
[`notion-ui-ux-resources.md`](./notion-ui-ux-resources.md). Star counts are an
**August 2026** snapshot.

Given: **the system is multi-tenant.** That single fact drives most of what
follows, so it's addressed first rather than treated as a deployment detail.

---

## 0. What multi-tenancy changes about the earlier surveys

Two things from the planner survey do **not** carry over:

- **The local-first CRDT stack is the wrong choice.** `yjs`, `rxdb` and `loro`
  assume a single user's data converging across their own devices. A multi-tenant
  CRM has many users editing shared records under a tenant boundary the client
  must not be trusted to enforce. Server-of-record with Postgres is the right
  shape; if you still want reactive sync to the client,
  [`electric-sql/electric`](https://github.com/electric-sql/electric) (10.3k) is
  the one that fits, because it syncs *from* Postgres and can respect row filters.
- **RBAC alone won't cover CRM permissions.** "Sales rep sees only their own
  accounts, their manager sees the team's, and this one deal is shared with legal"
  is relationship-based, not role-based. That's the problem Google's Zanzibar
  paper addresses, and it's why the authorization section below is separate from
  the identity section.

Everything from the **design** surveys carries over unchanged — Geist,
`styles/notion-density.css`, Radix Primitives, `cmdk`, TanStack Table, `dnd-kit`.
TanStack Table matters more here than it did for the planner: CRM is record grids,
saved views and filters.

---

## 1. Reference CRMs

| Repo | ★ | Notes |
| --- | --- | --- |
| [twentyhq/twenty](https://github.com/twentyhq/twenty) | 54.4k | **The primary reference.** "The open alternative to Salesforce", TypeScript, NestJS + React + GraphQL + Postgres, monorepo. Its UI is deliberately Notion/Linear-flavoured, which matches the design direction already set in this repo. Read it for the custom-object/custom-field metadata model — that's the hardest part of a CRM schema and it solves it in the open. |
| [frappe/crm](https://github.com/frappe/crm) | 3.2k | Focused, modern CRM (Vue) on the Frappe framework — much smaller surface than Twenty, so it's the faster read for domain modelling: leads, deals, activities. |
| [espocrm/espocrm](https://github.com/espocrm/espocrm) | 3.2k | Mature PHP CRM with a genuinely complete feature set — email integration, customer portal, kanban, sales automation. The best reference for *what a CRM must actually do*, even if you take no code. |
| [krayin/laravel-crm](https://github.com/krayin/laravel-crm) | 23.6k | Laravel CRM that tags itself `crm-multi-tenant-saas` — worth reading specifically for how it draws the tenant boundary. |
| [SuiteCRM/SuiteCRM](https://github.com/SuiteCRM/SuiteCRM) | 5.6k | The SugarCRM lineage. Dated architecture, but its module list (accounts, contacts, opportunities, quotes, contracts, cases, multi-currency) is an implicit domain checklist. |
| [hcengineering/platform](https://github.com/hcengineering/platform) | 27.2k | **Huly** — all-in-one platform (CRM + projects + chat + HR), TypeScript. Notably close to this project's ambition of merging surfaces, and worth studying for how it keeps many modules coherent. |
| [monicahq/monica](https://github.com/monicahq/monica) | 25.0k | Personal CRM. Different problem, but the best reference for *relationship* modelling — how people connect to each other, not just to deals. |
| [frappe/erpnext](https://github.com/frappe/erpnext) | 37.7k | Full ERP. Relevant if CRM eventually touches invoicing or inventory. |
| [Dolibarr/dolibarr](https://github.com/Dolibarr/dolibarr) | 7.5k | ERP/CRM with deep invoicing and quotation modelling. |
| [ever-co/ever-gauzy](https://github.com/ever-co/ever-gauzy) | 4.3k | TypeScript business platform (ERP/CRM/HRM); multi-tenant by design. |
| [idurar/idurar-erp-crm](https://github.com/idurar/idurar-erp-crm) | 8.6k | Small MERN ERP/CRM — useful as a minimal end-to-end example. |

---

## 2. Identity (authentication)

For multi-tenant SaaS the question isn't "which login library" — it's which one
models **organisations** as a first-class concept.

| Repo | ★ | Notes |
| --- | --- | --- |
| [logto-io/logto](https://github.com/logto-io/logto) | 14.3k | **Best fit on paper.** Its own description is "authentication and authorization infrastructure for SaaS and AI apps… with **multi-tenancy**, SSO, and RBAC", built on OIDC/OAuth 2.1. TypeScript, self-hostable. Start here. |
| [zitadel/zitadel](https://github.com/zitadel/zitadel) | 14.7k | Go identity platform with `multitenancy` as a declared topic, plus SCIM, passkeys, FIDO2 and FIPS-140-3. The stronger choice if enterprise compliance and SCIM provisioning matter. |
| [goauthentik/authentik](https://github.com/goauthentik/authentik) | 22.8k | Full IdP — OAuth2/OIDC/SAML/proxy. Heavier, very flexible; often deployed as the SSO layer in front of everything. |
| [casdoor/casdoor](https://github.com/casdoor/casdoor) | 14.1k | IAM/SSO with a web UI, broad protocol support (OIDC, SAML, CAS, LDAP, SCIM, WebAuthn). Pairs naturally with Casbin below. |
| [better-auth/better-auth](https://github.com/better-auth/better-auth) | 29.5k | TypeScript-native auth framework with an organisation/teams plugin. The lightest path if you want auth *inside* the app rather than a separate IdP service. |
| [nextauthjs/next-auth](https://github.com/nextauthjs/next-auth) | 28.3k | Ubiquitous, but bring your own tenancy model — it doesn't give you organisations. |
| [kanidm/kanidm](https://github.com/kanidm/kanidm) | 5.2k | Rust IDM, strong on correctness and LDAP compatibility. |
| [tinyauthapp/tinyauth](https://github.com/tinyauthapp/tinyauth) | 8.1k | Minimal OpenID-certified server; good for small self-hosted deployments. |

**Not verified:** Keycloak didn't surface in these searches and I haven't checked
it. It's the obvious enterprise default and should be evaluated alongside Logto and
Zitadel before you commit — treat its absence here as a gap in the survey, not a
verdict.

---

## 3. Authorization (the part CRM actually needs)

| Repo | ★ | Notes |
| --- | --- | --- |
| [apache/casbin](https://github.com/apache/casbin) | 20.3k | ACL/RBAC/ABAC as a library, in nearly every language. Lowest operational cost — no extra service. Good until permissions become relationship-shaped. |
| [authzed/spicedb](https://github.com/authzed/spicedb) | 6.9k | **Zanzibar-faithful** permissions database, ReBAC. The right tool for record-level sharing, team hierarchies and "who can see this deal". Most mature of the Zanzibar implementations. |
| [openfga/openfga](https://github.com/openfga/openfga) | 5.6k | CNCF Zanzibar engine, developer-friendly modelling language, now the common default in TS/Go stacks. |
| [Permify/permify](https://github.com/Permify/permify) | 5.9k | Zanzibar-inspired, now part of FusionAuth — factor that ownership change into any long-term bet. |
| [ory/keto](https://github.com/ory/keto) | 5.4k | Ory's permission server; fits if you're already using the Ory stack. |

**Recommendation:** Casbin if permissions stay role-shaped; SpiceDB or OpenFGA if
record-level sharing is a requirement. For a CRM it almost always becomes one, so
model the decision now even if you implement RBAC first — retrofitting ReBAC after
the schema is set is the expensive path.

---

## 4. Tenant isolation patterns

| Repo | ★ | Notes |
| --- | --- | --- |
| [vercel/platforms](https://github.com/vercel/platforms) | 6.7k | Full-stack Next.js multi-tenancy reference from Vercel — subdomain/custom-domain routing. Directly aligned with the Geist/Vercel stack here. |
| [ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) | 7.3k | Next.js + Tailwind + shadcn with auth, multi-tenancy, roles & permissions, i18n already wired. Best end-to-end worked example; mine it for structure, not for its theme (see the Notion survey's warning about competing token layers). |
| [hexclave/hexclave](https://github.com/hexclave/hexclave) | 6.8k | User-infrastructure platform covering auth, teams, RBAC, billing, subscriptions, API keys. |
| [archtechx/tenancy](https://github.com/archtechx/tenancy) | 4.4k | "Automatic multi-tenancy for Laravel, no code changes needed." Even off-stack, its docs are the clearest explanation of **schema-per-tenant vs row-scoped** trade-offs I found. |
| [juicycleff/ultimate-backend](https://github.com/juicycleff/ultimate-backend) | 2.9k | Multi-tenant SaaS starter, NestJS + CQRS + GraphQL + event sourcing. Architecturally close to Twenty's backend. |
| [abpframework/abp](https://github.com/abpframework/abp) | 14.4k | .NET, but the most rigorous published treatment of multi-tenancy as a framework concern — tenant resolution, per-tenant config, data filtering. Read the docs regardless of stack. |
| [pgaudit/pgaudit](https://github.com/pgaudit/pgaudit) | 1.7k | Postgres audit extension — tenant-aware audit trail at the database layer. |

On **Postgres row-level security**: the `row-level-security` topic surfaced only
small projects, so there's no canonical reference repo to point at. RLS is
nonetheless the mechanism most TS/Postgres multi-tenant apps use, and the honest
summary is that you'll be reading Postgres documentation rather than copying a
library. Decide early between RLS-enforced row scoping, schema-per-tenant, and
database-per-tenant — it's the least reversible choice in the system.

---

## 5. Email

The largest gap in the earlier surveys, and non-negotiable for CRM.

### Libraries (build the integration yourself)

| Repo | ★ | Notes |
| --- | --- | --- |
| [postalsys/imapflow](https://github.com/postalsys/imapflow) | 561 | Modern promise-based IMAP client for Node — the practical choice for reading mailboxes. Note it's the library behind the commercial EmailEngine, so check the licence terms for your use. |
| [nodemailer/nodemailer](https://github.com/nodemailer/nodemailer) | 17.6k | The Node SMTP sender. Effectively the standard. |
| [nodemailer/mailparser](https://github.com/nodemailer/mailparser) | 1.7k | MIME decoding — needed for threading, attachments and quoted-reply stripping. Same maintainer as the above. |
| [jstedfast/MailKit](https://github.com/jstedfast/MailKit) | 6.8k | If any part of the stack is .NET, this is the best-in-class IMAP/POP3/SMTP/MIME library. |

### Servers & platforms

| Repo | ★ | Notes |
| --- | --- | --- |
| [stalwartlabs/stalwart](https://github.com/stalwartlabs/stalwart) | 14.0k | Rust, all-in-one, fluent in IMAP, JMAP, SMTP **and CalDAV/CardDAV**. Uniquely relevant: one server covering mail, calendar and contacts, which is exactly this system's integration surface. |
| [postalserver/postal](https://github.com/postalserver/postal) | 16.7k | Mail delivery platform for **outgoing and incoming** mail with an API — the self-hosted answer to Mailgun/SendGrid. |
| [docker-mailserver/docker-mailserver](https://github.com/docker-mailserver/docker-mailserver) | 18.7k | Production-ready containerised stack (Postfix, Dovecot, Rspamd). |
| [mailcow/mailcow-dockerized](https://github.com/mailcow/mailcow-dockerized) | 13.2k | Full groupware suite, dockerised. |
| [Mailu/Mailu](https://github.com/Mailu/Mailu) | 7.4k | Mail server as composable Docker images. |

### Client references

| Repo | ★ | Notes |
| --- | --- | --- |
| [kurrier-org/kurrier](https://github.com/kurrier-org/kurrier) | 1.0k | **Closest architectural match found.** Self-hosted workspace for email + calendar + contacts + storage, in TypeScript/Next.js, with IMAP/SMTP, CalDAV/CardDAV and pluggable senders (SES, Postmark, Mailgun, SendGrid). Young, but it's the exact integration shape this CRM needs. |
| [Foundry376/Mailspring](https://github.com/Foundry376/Mailspring) | 17.7k | Mature cross-platform client — read it for threading and sync-engine design. |
| [pimalaya/himalaya](https://github.com/pimalaya/himalaya) | 6.9k | Rust CLI over IMAP/SMTP; small enough to read end to end. |

---

## 6. Contacts sync (CardDAV)

CRM contacts should ideally round-trip with users' address books.

| Repo | ★ | Notes |
| --- | --- | --- |
| [Kozea/Radicale](https://github.com/Kozea/Radicale) | 4.9k | Small CalDAV/**CardDAV** server — fastest local sync target for tests. |
| [pimutils/vdirsyncer](https://github.com/pimutils/vdirsyncer) | 1.9k | Contact/calendar sync; read for conflict resolution. |
| [bitfireAT/davx5-ose](https://github.com/bitfireAT/davx5-ose) | 2.8k | Reference CardDAV client implementation. |

---

## 7. Custom fields & flexible schema

Every CRM needs user-defined fields. Either model it yourself (see Twenty) or
build on a platform that already solved it.

| Repo | ★ | Notes |
| --- | --- | --- |
| [directus/directus](https://github.com/directus/directus) | 37.2k | Wraps an existing SQL database with instant APIs, auth and an admin UI — **keeps your Postgres schema yours**, which is the key difference from the others. Strongest candidate if you want a head start without ceding the data model. |
| [nocobase/nocobase](https://github.com/nocobase/nocobase) | 23.6k | No-code platform built around a plugin architecture and a data-modelling core; explicitly used to build CRMs. |
| [teableio/teable](https://github.com/teableio/teable) | 21.6k | Airtable alternative on Postgres — good reference for field-type systems and view models. |
| [baserow/baserow](https://github.com/baserow/baserow) | 5.5k | Airtable alternative, Python/Postgres, self-hosted. |
| [Budibase/budibase](https://github.com/Budibase/budibase) | 28.2k | Internal-tools builder with automations. |
| [ToolJet/ToolJet](https://github.com/ToolJet/ToolJet) | 38.3k | Internal app builder; useful for admin surfaces you don't want to hand-build. |

---

## 8. Reporting & analytics

| Repo | ★ | Notes |
| --- | --- | --- |
| [cube-js/cube](https://github.com/cube-js/cube) | 20.6k | **Semantic layer for embedded analytics.** The right primitive for multi-tenant reporting: define metrics once, enforce per-tenant security context on every query. Better fit than a bolted-on BI tool. |
| [metabase/metabase](https://github.com/metabase/metabase) | 48.6k | Easiest self-serve BI with embedding; sandboxing supports per-tenant row filters. |
| [apache/superset](https://github.com/apache/superset) | 74.2k | Most powerful open BI platform; heavier to operate. |
| [getredash/redash](https://github.com/getredash/redash) | 28.7k | Query-and-dashboard tool, simpler model. |
| [lightdash/lightdash](https://github.com/lightdash/lightdash) | 6.0k | BI on top of dbt metrics. |
| [evidence-dev/evidence](https://github.com/evidence-dev/evidence) | 6.8k | BI as code — SQL + markdown, version-controlled. Good for fixed operational reports. |
| [helicalinsight/helicalinsight](https://github.com/helicalinsight/helicalinsight) | 392 | Small, but notable for advertising **multi-tenancy plus row-level security plus embedding** in the community edition — a rare combination. |
| [grafana/grafana](https://github.com/grafana/grafana) | 76.1k | For operational dashboards, not customer-facing sales reporting. |

For in-app charts rather than an embedded BI tool, use the repo's `dataviz` skill
and render with Geist tokens.

---

## 9. Search

| Repo | ★ | Notes |
| --- | --- | --- |
| [meilisearch/meilisearch](https://github.com/meilisearch/meilisearch) | 58.9k | Typo-tolerant, fast, simple to run; **tenant tokens** exist precisely for scoping results per tenant. Best default. |
| [typesense/typesense](https://github.com/typesense/typesense) | 26.4k | Comparable, with multi-tenant scoped API keys. Choose on operational preference. |
| [manticoresoftware/manticoresearch](https://github.com/manticoresoftware/manticoresearch) | 11.9k | SQL-native full-text and vector search. |
| [nextapps-de/flexsearch](https://github.com/nextapps-de/flexsearch) | 13.8k | In-process JS search — useful for client-side filtering of an already-scoped record set, not as the system of record. |

Whichever you choose, tenant scoping must be enforced when minting the search key,
never by filtering in the client.

---

## 10. Deduplication & data quality

Duplicate contacts are the classic CRM failure mode.

| Repo | ★ | Notes |
| --- | --- | --- |
| [dedupeio/dedupe](https://github.com/dedupeio/dedupe) | 4.5k | Python library for fuzzy matching, deduplication and entity resolution; active-learning based. The standard choice. |
| [moj-analytical-services/splink](https://github.com/moj-analytical-services/splink) | 2.3k | Probabilistic record linkage at scale across SQL backends (DuckDB, Spark). Better when volumes are large or matching must run in-database. |
| [alan-turing-institute/CleverCSV](https://github.com/alan-turing-institute/CleverCSV) | 1.3k | Dialect detection for messy real-world CSVs — worth it purely for import robustness. |

### Import UX

| Repo | ★ | Notes |
| --- | --- | --- |
| [implerhq/impler.io](https://github.com/implerhq/impler.io) | 288 | CSV/Excel import experience for SaaS — column mapping, validation, review. Small project; evaluate before depending on it. |
| [yobulkdev/yobulkdev](https://github.com/yobulkdev/yobulkdev) | 912 | Open data-onboarding platform, positioned as a Flatfile alternative. |
| [tilo/smarter_csv](https://github.com/tilo/smarter_csv) | 1.6k | Ruby, but a good reference for handling messy user uploads. |

No strong, well-maintained React import component surfaced. Expect to build the
mapping UI yourself on TanStack Table — which is straightforward, and the survey
should say so rather than recommend something thin.

---

## 11. Automation & workflows

| Repo | ★ | Notes |
| --- | --- | --- |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | 199.5k | 400+ integrations, self-hostable, embeddable. The pragmatic way to give users CRM automations without building an integration platform. **Note: fair-code, not OSI open source** — check the licence against your commercial plans. |
| [temporalio/temporal](https://github.com/temporalio/temporal) | 22.1k | Durable execution. The right foundation for reliable multi-step internal processes — email sequences, sync jobs, retries that must not silently drop. |
| [conductor-oss/conductor](https://github.com/conductor-oss/conductor) | 32.1k | Event-driven durable workflow engine. |
| [PrefectHQ/prefect](https://github.com/PrefectHQ/prefect) | 23.6k | Python orchestration, for data pipelines rather than user-facing automations. |
| [enescingoz/awesome-n8n-templates](https://github.com/enescingoz/awesome-n8n-templates) | 24.5k | 280+ ready workflows (Gmail, Slack, Notion, OpenAI) — a shortcut for stock automations. |

Distinguish the two needs: **user-visible automation rules** (n8n-shaped) and
**internal reliability** (Temporal-shaped). They are not the same system.

---

## 12. Telephony

| Repo | ★ | Notes |
| --- | --- | --- |
| [fonoster/fonoster](https://github.com/fonoster/fonoster) | 8.1k | "The open-source alternative to Twilio" — programmable voice, TypeScript, Kubernetes-native. Clearest fit for click-to-call and call logging. |
| [signalwire/freeswitch](https://github.com/signalwire/freeswitch) | 5.1k | The heavy-duty softswitch; use if you need real PBX capability. |
| [pion/webrtc](https://github.com/pion/webrtc) | 16.7k | Pure Go WebRTC — for in-browser calling. |

---

## 13. Audit trail

| Repo | ★ | Notes |
| --- | --- | --- |
| [pgaudit/pgaudit](https://github.com/pgaudit/pgaudit) | 1.7k | Audit at the Postgres layer — hard to bypass, which is the point for compliance. |
| [collectiveidea/audited](https://github.com/collectiveidea/audited) | 3.5k | Rails ORM change-logging; read for the **model** (versioned change records per entity). |
| [izelnakri/paper_trail](https://github.com/izelnakri/paper_trail) | 600 | Same idea in Elixir/Ecto, with revert. |

No mature TypeScript equivalent surfaced. With Postgres you'd typically combine
`pgaudit` for the compliance trail with an application-level activity/timeline
table — which a CRM needs anyway, since "what happened on this account" is a
product feature, not just a log.

---

## Recommended starting stack

1. **Read Twenty first.** It's the closest thing to this project's target, in the
   right language, with the custom-field problem already solved.
2. **Tenancy:** Postgres with row-scoped tenancy enforced by RLS; decide RLS vs
   schema-per-tenant before writing schema.
3. **Identity:** Logto (organisations built in) or Zitadel (if SCIM/compliance
   matters). Evaluate Keycloak too — this survey didn't.
4. **Authorization:** Casbin now, but model for OpenFGA/SpiceDB if record-level
   sharing is on the roadmap.
5. **Email:** `imapflow` + `mailparser` + `nodemailer`, with Stalwart or Postal if
   you host mail. Read `kurrier` for how the pieces fit.
6. **UI:** unchanged — Geist, `notion-density.css`, Radix Primitives, TanStack
   Table, `cmdk`, `dnd-kit` for pipeline kanban.
7. **Search:** Meilisearch with per-tenant tokens.
8. **Reporting:** Cube as a semantic layer, so tenant security lives in one place.
9. **Automation:** Temporal for internal reliability; n8n for user-facing rules,
   licence permitting.

## Open questions I can't answer without you

These change the architecture, so they're worth settling before scaffolding:

- **Tenant isolation level** — shared tables with RLS, schema per tenant, or
  database per tenant? Drives everything downstream.
- **Self-hosted or SaaS?** Decides whether you run mail and telephony yourself.
- **Do tenants need custom fields/objects?** If yes, that's Twenty's metadata
  model and it's a foundational decision, not a later feature.
- **Does email need two-way sync**, or is logging outbound enough? Two-way IMAP
  sync is a large subsystem on its own.
- **Record-level sharing rules?** Decides Casbin vs OpenFGA/SpiceDB.
- **Stack for the backend** — the design layer here is Geist/CSS and
  framework-agnostic, so nothing so far constrains this.
