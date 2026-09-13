# ShipFaster competitor parity audit

Audit date: 12 September 2026

Scope: Shiprocket, Shipway, iThink Logistics, NimbusPost, and the current ShipFaster repository. This is a product/workflow parity plan, not a recommendation to copy another company's brand, copy, imagery, or proprietary UI.

## Executive decision

ShipFaster already has unusually broad UI coverage. The next release should not add another generic marketing section or another disconnected dashboard page. It should finish the operational spine and make existing screens trustworthy:

1. restore authentication and finish KYC/onboarding gates;
2. connect real storefronts and carriers;
3. complete label, manifest, pickup, tracking, and webhook workflows;
4. automate NDR buyer contact and the returns/refund lifecycle;
5. add claims/protection and finance reconciliation;
6. only then expand into B2B cargo, international, fulfillment/WMS, checkout, and fraud prevention.

The repository currently routes login and registration directly to `/app/home`. This is acceptable for a demo, but it must not ship as production behaviour.

## Competitor patterns worth matching

| Capability | Shiprocket | Shipway | iThink | NimbusPost | ShipFaster now | Recommendation |
|---|---|---|---|---|---|---|
| Multi-carrier rates and allocation | Strong, AI recommendation | ShipSense AI allocation | AI recommendation | Smart allocation | Rate-card comparison; cheapest/fastest badge | Add serviceability, carrier health, zone SLA, NDR/RTO rate and configurable allocation rules |
| Order ingestion | Channels, API, bulk | Multichannel OMS and bulk processing | Channels/API | 12+ channels and order sync | Manual, CSV, UI-only connector setup | P0: Shopify OAuth/webhooks, WooCommerce keys, robust XLSX/CSV mapper, sync log and retry queue |
| Dispatch documents | Labels, invoices, manifests | Bulk labels/invoices | Core shipping flow | Bulk labels/unified processing | Partial; missing carrier label URLs in common paths | P0: carrier PDF storage, bulk labels, GST invoices, manifest close/reopen and pickup handover proof |
| Pickups | Multiple pickup locations and escalation | Scheduling | Multi-pickup implied | Multiple locations | Pickup route reuses shipment list | Build a dedicated pickup calendar/list, cutoff warnings, missed-pickup escalation and handover status |
| Tracking/notifications | Branded tracking, SMS/email/WhatsApp, EDD | Branded tracking and proactive notifications | White-label tracking and WhatsApp/SMS | Branded tracking, WhatsApp/SMS, EDD | Strong tracking UI/customizer; communications not connected | P0/P1: normalized carrier scans, notification rules/templates/logs, custom domain verification, real EDD |
| NDR and RTO | Automated NDR, buyer actions, address/RTO intelligence | Automated follow-up via WhatsApp/IVR/SMS | Six-step NDR and auto-reattempt | Automated NDR plus human calls | Action UI and status transitions | Connect buyer OTP/WhatsApp/IVR, carrier reattempt API, evidence, escalation SLA and disposition audit |
| Returns/exchanges | Reverse shipment and easy returns | Self-serve portal, rules, QC, refund integrations | Reverse workflow | Reverse pickup with QC | Seller return screen; partial backend | Add buyer portal, eligibility policy/rules, exchange orders, QC checklist/media, refund rails and refund ledger |
| Weight disputes | Reconciliation | Low-dispute promise | Discrepancy process | Weight freezing and transparent details | Good dispute UI | Add scan evidence ingestion, deadlines, auto-alerts, carrier response webhook and credits ledger |
| COD/finance | Early COD and unified ledger | D+2 COD and reconciliation | Weekly/next-day COD | One-day payout add-on | Wallet and COD pages | Add settlement cycles, downloadable remittance advice, bank verification, invoice adjustment, GST TDS/TCS and exception matching |
| Protection/claims | Shipment security/claims | Shipment protection | Not prominent | Insurance cover | Marketing mention only | Add opt-in at booking, premium/coverage display, loss/damage claim flow, documents, adjudication and payout tracking |
| Analytics | Dashboard, courier and delivery performance | Shipping/returns analytics | Logistics reports | Custom analytics | Dashboard/reports | Add carrier × lane × zone cohorts, pickup SLA, NDR recovery, COD ageing, RTO cost, WISMO and returns/refund TAT |
| B2B/cargo | Cargo, multi-mode, appointment delivery | Bulk cargo | Enterprise shipping | Multi-packet AWB, WMS, POD, appointments | Not present | P2 product line with separate shipment model, e-way bill, LR, appointments and POD |
| International | Available | Not core | Global positioning | Offered | Calculator says coming soon | P2: country/postcode, KYC/IEC, HS code, duties, commercial invoice and DDP/DDU quote flow |
| Fulfillment/WMS | Fulfillment/omnichannel | Fulfillment automation | Not core | Fulfillment and WMS integration | Warehouses only | P2: inventory, bins, inwarding, pick-pack, stock sync and replenishment |
| Conversion/fraud | Checkout, EDD, partial COD | Fraud detection, COD verification/conversion | Address/NDR intelligence | COD confirmation, partial COD | Not present | P1: address quality, risky phone/address/pincode, COD OTP, partial prepaid and block/allow rules |
| Support | Ticket/escalation ecosystem | Support positioning | Stakeholder communication | Account manager/call center tiers | Contact page; no seller ticket centre | Add contextual tickets linked to AWB/order, SLA, attachments, activity timeline and escalation matrix |

## Public website: section-by-section

### Global navigation

Current: Home, Features, Integrations, Pricing, Track Order, Contact.

Add a two-level product navigation so visitors can understand the platform without reading one very long homepage:

- Products: Domestic Shipping, B2B Cargo, International, Returns, Tracking, Checkout/RTO Reduction, Fulfillment.
- Platform: Integrations, API & Developers, Courier Partners, Rate Calculator, Serviceability.
- Solutions: D2C Brands, Social Sellers, Marketplaces, Enterprise, Offline Brands.
- Resources: Help Centre, API Docs, Shipping Glossary, Packaging Guide, Blog, Status Page.
- Company: About, Contact, Careers, Partners.

Every navigation item should have a real destination. Do not point several footer links to the same generic `/features` page.

### Announcement bar

Current: a static first-shipment discount.

Add offer terms, expiry, eligibility and a destination landing page. Load promotions from configuration so finance/marketing can retire an offer without a deployment.

### Hero

Keep the current clear multi-courier positioning, but make the proof testable:

- show “Check serviceability” and “Calculate shipping rate” without login;
- separate “Start shipping” from “Talk to sales”;
- avoid publishing courier/pincode/rate claims unless backed by the live network;
- show an interactive 30-second path: enter route → compare → create account → ship.

### Trust and proof

Competitors use customer logos, metrics and testimonials heavily. Add verified customer stories with shipment volume band, problem, measurable result and permission. Also add courier/integration logos only for partners that are actually connected.

### Product capabilities

Replace repeated feature-card sections with six outcome-led blocks:

1. import and verify orders;
2. compare and allocate the right courier;
3. pack, label, manifest and hand over;
4. track and proactively inform buyers;
5. recover NDR and control RTO;
6. reconcile COD, billing, returns and disputes.

Each block should link to a dedicated detail page and show the exact workflow, not only marketing copy.

### How it works

The current ORDER → COMPARE → CHOOSE → SHIP → TRACK → DELIVER sequence is good. Expand it to include the two exception branches:

- delivery failure → buyer confirmation → reattempt or RTO;
- buyer return → eligibility/QC → reverse pickup → refund/exchange.

### Integrations

Separate “available”, “beta”, and “planned”. Today the public integration catalogue promises more than the seller connectors actually deliver. Each integration page needs supported objects, sync direction, frequency, setup steps, permissions, limitations, last sync visibility and troubleshooting.

### Pricing

Add an actual cost model:

- shipping slab and zone assumptions;
- COD fee (fixed or percentage minimum);
- RTO/reverse charges;
- fuel/remote/ODA and other surcharges;
- GST treatment;
- NDR, notifications, protection and early-COD add-ons;
- wallet minimums/refund rules;
- downloadable sample invoice.

NimbusPost's volume bands are a useful information pattern, but ShipFaster should price from its own unit economics.

### Tracking page

The current experience is visually rich. Production parity requires carrier-normalized events, promised EDD, privacy-safe buyer verification, notification preference, NDR response, delivery instructions, POD, support, and branded custom-domain resolution. Hide delivery-agent contact unless the carrier provides an approved relay number.

### Footer and compliance

Add real pages for Terms, Privacy, Refund/Cancellation, Shipping Policy, Prohibited Items, Claims Policy, COD Terms, Grievance Officer, Security, DPA, Cookie Policy and system status. Add GST/company/legal identity and support hours.

## Public website: page-by-page backlog

| Page | Current state | Required next version |
|---|---|---|
| `/` | Comprehensive landing page | Shorten repetition; route users into product pages; expose live rate/serviceability demo; add verified proof |
| `/features` | General feature overview | Convert to indexed capability hub with product detail links and plan availability |
| `/solutions` | Exists but absent from primary nav | Add segments and role-specific workflows/results; restore to navigation |
| `/couriers` | Courier/pincode content | Display supported services, modes, COD, max weight, regions, SLA and live incident state |
| `/integrations` | Broad catalogue | Mark live/beta/planned accurately; add integration-specific pages and setup/status documentation |
| `/pricing` | Marketing pricing | Total-cost calculator, add-ons, RTO/reverse/COD examples, terms and plan comparison |
| `/track` | Strong UI | Live normalized scans, authenticated sensitive actions, notification/POD/support integration |
| `/about` | Exists but absent from primary nav | Add legal entity, leadership, operations footprint and trust/security proof |
| `/contact` | Public contact page | Route sales/support/claims/partnerships separately; issue reference and SLA |
| New `/rate-calculator` | Seller-only equivalent exists | Public no-login estimate with transparent assumptions and lead handoff |
| New `/serviceability` | Widget only | Public PIN-to-PIN check including payment/mode/weight constraints |
| New `/returns` | No public buyer entry | Buyer self-serve return/exchange request and status tracking |
| New `/developers` | Seller portal only | Public API reference, auth, errors, idempotency, webhook signatures, SDK/examples and status |
| New `/help` | Missing | Searchable task-based help centre |
| New `/security` and legal pages | Missing | Compliance, data handling, policies and grievance contact |
| New product/solution detail pages | Mostly missing | SEO- and sales-ready pages for Domestic, NDR, Returns, Tracking, B2B, International, Fulfillment and industry segments |

## Seller panel: page-by-page workflow

### Authentication and onboarding — P0

Target flow:

`Register → verify email/mobile → business type → PAN/GST/CIN → KYC documents → bank verification → pickup/RTO address → default package → accept terms → recharge or postpaid approval → first test shipment`

Add saved progress, explicit verification states, rejection reasons, resubmission and admin review. Protect `/app` and `/admin` by role; never rely on hidden navigation as authorization.

### Home and dashboard — P0/P1

Home should be a task inbox: finish KYC, low balance, orders waiting to ship, pickup failures, NDR deadlines, disputes expiring, COD due, integration failures. Dashboard should be analytical and filterable by date, warehouse, channel, courier, zone, payment mode and service.

### Orders — P0

Target flow:

`Import/sync/create → validate buyer/address/GST/items → flag risk → confirm COD → select warehouse/package → rate/serviceability → allocate courier → generate AWB → label/invoice → add to pickup/manifest`

Required additions: idempotency, duplicate detection, address quality, multi-package orders, partial COD, insurance selection, custom invoice fields, e-way bill threshold handling, allocation rules and complete order detail/activity history.

### Imports and integrations — P0

Finish XLSX support, reusable field maps, row-level correction, async job progress, downloadable failure file, retry, duplicate strategy and import audit. Add real OAuth/credential exchange, encrypted secrets, webhook registration, sync cursors, health checks and per-order error repair.

### Shipments, labels and manifests — P0

Target flow:

`AWB assigned → carrier label saved → bulk print → manifest grouping → close manifest → pickup scheduled → handover OTP/signature → picked up → tracking polls/webhooks`

Separate shipments and pickups instead of rendering the same page. Support cancel-before-pickup, AWB reassignment rules, label sizes (A4/A6), thermal print, invoices, manifests and scan sheet.

### Courier/rate selection — P0/P1

Show total landed cost, COD fee, RTO estimate, pickup cutoff, mode, estimated delivery, serviceability, historical lane performance, NDR/RTO rate and recommendation rationale. Add admin-configured seller rate cards, margins, carrier priority/blocks and fallback allocation.

### Tracking and notifications — P0/P1

Create a canonical status mapper and deduplicate/reorder carrier events. Add event-driven Email/SMS/WhatsApp templates, opt-out/compliance, delivery logs, retries, cost reporting and preview/test. Signed public links should expose only the intended shipment.

### NDR — P0/P1

Target flow:

`Carrier NDR received → reason normalized → deadline starts → buyer WhatsApp/IVR/SMS → buyer verifies via OTP → address/date/instruction captured → seller review if needed → carrier reattempt API → escalation → delivered or RTO`

Add automated policies, attempt count, buyer response evidence, false-NDR dispute, address risk, escalation SLA and a complete immutable activity log.

### RTO — P1

Add predicted RTO risk, forward-versus-RTO cost, in-transit events, origin receipt/QC, accepted/rejected/damaged/short receipt, inventory disposition and claim linkage.

### Returns — P1

Target flow:

`Buyer request → policy eligibility → images/reason → approve/reject/auto-rule → exchange/refund choice → reverse courier/QC → pickup → warehouse QC → restock/dispose → refund/exchange shipment → notification`

Support refund providers, refund status/UTR, QC checklist, evidence, return pickup failures and return analytics.

### Weight disputes — P1

Keep the current UI, then automate carrier weight ingestion, photo/dimension proof, dispute deadline, response evidence, wallet hold/charge/credit and repeat-lane alerts. “Weight freezing” should be offered only where contractually supported.

### Wallet, billing and COD — P0/P1

Create separate ledgers for wallet, freight invoices, COD receivable, remittance and adjustments. Add payment gateway recharge, GST invoice/credit/debit note, COD cycle, bank verification, remittance advice, UTR, ageing, deductions and reconciliation exceptions. Early COD needs eligibility, fee disclosure and risk controls.

### Reports — P1

Add saved filters, scheduled email, async CSV/XLSX download and data dictionary. Priority reports: shipment cost, courier/lane SLA, pickup failure, NDR recovery, RTO cost, COD ageing/reconciliation, weight disputes, returns/QC/refund TAT and notification delivery.

### Developer portal — P0/P1

Store API keys hashed, reveal secret once, support revoke/rotate, granular scopes, expiry, IP restrictions and audit. Webhooks need signed delivery, retries/backoff, replay, per-attempt logs, endpoint disable rules and a test event. Publish idempotency and versioning guarantees.

### Team and settings — P0/P1

Add invitations, role templates, warehouse/data scope, MFA, session/device management, maker-checker for refunds/COD/bank changes, full audit log, notification defaults, label/invoice customization and verified custom tracking domains.

### Support centre — P1

New seller page: tickets linked to order/AWB/manifest/remittance/dispute, category-specific forms, carrier escalation, attachments, SLA clock, responses and reopen rules.

## Admin/control tower backlog

The existing admin pages cover sellers, couriers, rates, reconciliation, audits, NDR, disputes and COD. Add:

- KYC document review and maker-checker;
- carrier credential/config health and webhook incident view;
- pickup failure and aged-shipment queues;
- claims/protection adjudication;
- support ticket routing and SLA breach queue;
- notification templates/providers/costs;
- fraud/risk rule configuration;
- invoice, credit/debit note and payout approvals;
- feature flags and seller entitlements;
- operations status page and incident communication;
- PII redaction, retention/export/delete tooling.

## Data and backend work needed for genuine parity

1. Create canonical domain models for channel orders, packages, carrier services, pickup batches, manifests, tracking events, notification attempts, claims, return QC, refunds, tickets and settlements.
2. Use idempotency keys on order creation, booking, refunds and webhook ingestion.
3. Introduce job queues with retry/dead-letter handling for sync, labels, tracking polls, notifications, exports and webhooks.
4. Encrypt carrier/store credentials; hash API keys; rotate secrets.
5. Add row-level tenant isolation, admin RBAC and audit records for every financial/status mutation.
6. Reconcile external carrier events against a strict state machine; never let the browser manually simulate production shipment progression.
7. Add observability: request correlation IDs, carrier latency/error dashboards, job age, webhook lag and alerting.
8. Add contract tests per carrier adapter and replayable fixtures for each status/reason.

## Delivery sequence

### Release 1 — trustworthy domestic shipping (P0)

- authentication, roles and KYC gates;
- one real storefront connector and at least two real carrier adapters;
- order validation and serviceability;
- booking, labels, invoice, manifest and dedicated pickups;
- normalized live tracking;
- wallet recharge and basic invoices/COD ledger;
- secure API keys/webhooks;
- production audit/security checks.

Exit criterion: a real seller can import an order, book it, hand it over, track it, and reconcile the charge without staff changing database rows.

### Release 2 — exception and cash-flow automation (P1)

- notifications and branded domain;
- automated NDR/reattempt/escalation;
- self-serve returns, QC, exchange/refund;
- weight dispute automation;
- COD reconciliation/early COD;
- shipment protection/claims;
- support tickets and advanced analytics;
- address/COD risk controls.

Exit criterion: common NDR, RTO, return, dispute, claim and COD exceptions complete end-to-end with evidence and audit trails.

### Release 3 — expansion products (P2)

- B2B/cargo;
- international;
- fulfillment/WMS and inventory;
- checkout/EDD/conversion tools;
- enterprise postpaid, SSO, custom roles and data exports.

## Acceptance tests for the core workflow

1. A Shopify order syncs once even when its webhook is retried.
2. Invalid address/PIN/phone/package data blocks booking with a repair path.
3. Rate comparison includes all charges and expires stale quotes.
4. Booking retry cannot buy two AWBs for one package.
5. A carrier label, invoice and manifest are printable and stored against the shipment.
6. Pickup handover creates proof and switches tracking ownership to carrier events.
7. Out-of-order or duplicate carrier events do not corrupt shipment state.
8. NDR buyer response produces one auditable reattempt/RTO instruction before cutoff.
9. A return applies the configured policy, records QC, and completes refund or exchange.
10. Weight/COD/claim adjustments create balanced ledger entries and cannot be silently edited.
11. Seller A cannot access Seller B's shipment through UI, API, storage URL or realtime subscription.
12. Every external call and financial/status mutation has correlation and audit records.

## Official pages reviewed

- Shiprocket features: https://sr-website.shiprocket.in/features/
- Shiprocket courier platform: https://www.shiprocket.in/ecommerce-courier/
- Shiprocket feature/product updates: https://www.shiprocket.in/techsphere/
- Shipway: https://www.shipway.com/
- Shipway fulfillment software: https://capp.shipway.com/home.php
- iThink Logistics: https://www.ithinklogistics.com/
- NimbusPost features: https://nimbuspost.com/features
- NimbusPost pricing: https://nimbuspost.com/pricing

Feature claims change. Validate partner counts, pincode coverage, prices, payout timing and integrations against signed commercial/technical documentation before publishing comparisons or promises.
