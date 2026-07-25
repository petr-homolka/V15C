# CraftUI CRM Design System

A design system extracted from the attached Figma community file **"CRM UI Kit for SaaS Dashboards (Community)"**. It powers a CRM product ("vlastní CRM systém" — the user's own CRM). Source: mounted `.fig` virtual filesystem (pages: UI-Kit, Login-Register, Dashboard, Contact, Messenger, Kanban, Task, Project, Calendar, Products, Invoices, File-Browser, Notification, Reports, Help-Center, Get-full-version). No GitHub repo or codebase was attached.

The kit's own demo brand is **CraftUI** (a real logo mark + wordmark exist in the source — see Brand below); there is no separate company name in the source, so this design system is built and named around that in-file brand.

## Index

- `styles.css` — root stylesheet, imports everything below
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, plus generated `fig-tokens.css` (Figma Variables) and `fig-typography.css`
- `components/core` — buttons (plain / icon / link, all states)
- `components/forms` — inputs, checkboxes, radios, switches
- `components/dataviz` — tags, badges, progress bars
- `components/navigation` — tabs, pagination, top bar, nav rail, UI Kit Header
- `components/widgets` — counters, graphs, tables, sidebar cards, filters
- `ui_kits/crm-dashboard/` — interactive click-through CRM UI kit (Sign In → Dashboard → Contacts → Messenger → Kanban → Invoices)
- `guidelines/` — foundation specimen cards (colors, type, spacing, brand, icons)
- `assets/logo/` — the CraftUI logo mark (SVG, copied verbatim from the source)

## Content fundamentals

Copy in the source is minimal (it's a UI kit, not a marketing site) but consistent:
- **Product voice, second person, plain and short**: "Welcome to our CRM.", "Sign In to see latest updates.", "Enter your details to proceed further", "Recover password", "Or sign in with".
- **Sentence case** for body copy and helper text; **Title Case only for nav labels and section headers** (e.g. "Upcoming events", "Income per lead").
- Numbers/data are concrete and specific, not rounded-sounding: "$1.870", "15.10%", "2.890" — real-feeling dummy data, not lorem ipsum.
- No emoji anywhere in the source.
- Tone is efficient and businesslike — a SaaS ops tool, not a consumer app.

## Visual foundations

- **Color**: one primary blue (`#5E81F4`, active `#1B51E5`), a near-black ink (`#1C1D21`) for text, and a family of very light neutrals (`#F5F5FA`/`#F0F0F3`/`#ECECF2`) for surfaces/borders. Secondary/chart colors (cyan `#40E1FA`, violet `#9698D6`/`#CB68FE`, red `#FF808B`, green `#7CE7AC`, amber `#F4BE5E`) appear only in charts, avatars, and status tags — never as primary UI chrome. Max effectively 2 background colors per screen (white cards on `#F5F5FA` page bg, or the blue gradient on auth screens).
- **Type**: Lato Bold for all headings and button labels; Source Sans Pro Regular/SemiBold for body copy and long-form text; a bundled icon font (`la-solid-900` / Line Awesome) for all glyphs. Exact sizes from the file are used verbatim (32/26/22/18 for H1–H4, 16/14/12 for body/caption) — not snapped to a 4px scale.
- **Spacing**: mostly 4px-increment paddings/gaps (4, 8, 12, 16, 20, 24, 28, 32, 40) but exact per-component values are preserved (e.g. a button is 46px tall, not 48).
- **Backgrounds**: flat color, no photography-heavy hero imagery in the core app (auth screens use a radial gradient + decorative abstract vector illustration, not a photo). No textures, patterns, or grain.
- **Corner radii**: 5px (small chips/avatars), 8px (buttons, inputs, tags), 12px (cards/panels), pill (999px) for status pills.
- **Cards**: white surface, no border, soft ambient shadow (`--shadow-card`), 12px radius — never a colored left-border accent.
- **Shadows**: soft, ambient, low-opacity (`rgba(153,155,168,0.1)` family) — never harsh drop shadows.
- **Buttons**: primary = solid blue fill, white label; secondary/"outline" = 10% blue-tint fill with blue label (not a stroked outline in the literal sense — it's a tinted fill); hover darkens/intensifies the tint, active goes to solid `#1B51E5`, disabled desaturates to grey.
- **Hover/press**: hover = tint intensifies or background lightens; active/press = solid color deepens (no scale/shrink transforms observed in the source).
- **Borders**: hairline 1px dividers in `#ECECF2`/`#F0F0F3` — used for list separators and panel edges, never a bordered card by itself (shadow does that job).
- **Transparency/blur**: occasional low-opacity overlays (10–25% grey) for hover states and empty avatar tiles; no backdrop-blur/glassmorphism in the source.
- **Animation**: the static file defines no motion; treat hover/press as the only interaction states and keep any added transitions short and linear-ish (150–200ms), matching the flat, utilitarian tone — do not invent bouncy/spring easing.
- **Imagery color vibe**: sparse — a handful of decorative photographic images appear inside product/contact cards (copied to `assets/` where used), warm-neutral tones, no heavy grain or duotone treatment observed.

## Iconography

- **System**: Line Awesome (`la-solid-900` regular icons, `la-regular-400` outline variants, `la-brands-400` brand glyphs) — a webfont icon system, not individual SVGs. Loaded via CDN (`line-awesome` on jsdelivr) since the source stores icons as font glyphs, not exportable vector assets.
- No emoji, no unicode-character icons observed.
- A handful of decorative illustration/abstract vector graphics exist only on the Sign In / Sign Up auth screens (baked into those screen components) — not a general illustration library.
- The **CraftUI logo** (a real vector mark, not text) was copied verbatim to `assets/logo/`.

## Components — built (343 of 352 kit families)

Full index by directory (component name = its export from `window.CraftUICRMDesignSystem_b01735`):

**auth** (4): Details, Finish, Recover, SignUp

**calendar** (4): Calendar, CalendarDay, CalendarEvent, CalendarWeek

**calendar-mobile** (3): CalendarDayMobile, CalendarEventMobile, CalendarMonthMobile

**contacts** (26): ContactsAddNew, ContactsDetails, ContactsEmpty, ContactsGrid01, ContactsGrid02, ContactsGrid03, ContactsList02, ContactsList03, ContactsProfile01, ContactsProfile02, ContactsSettingsAccounts, ContactsSettingsBilling, ContactsSettingsGeneral, ContactsSettingsNotifications, ContactsSettingsSecurity, TablesContactsGrid01Mobile, TablesContactsGrid01Web, TablesContactsGrid02Web, TablesContactsGrid03Mobile, TablesContactsGrid03Web, TablesContactsRow01Mobile, TablesContactsRow01Web, TablesContactsRow02Mobile, TablesContactsRow02Web, TablesContactsRow03Mobile, TablesContactsRow03Web

**contacts-mobile** (17): ContactsDetailsActionsMobile, ContactsDetailsMobile, ContactsEmptyMobile, ContactsGrid01Mobile, ContactsGrid02Mobile, ContactsGrid03Mobile, ContactsList01Mobile, ContactsList02Mobile, ContactsList03Mobile, ContactsProfileOverview01Mobile, ContactsProfileOverview01Tasks, ContactsProfileOverview02Mobile, ContactsSettingsAppsMobile, ContactsSettingsBillingMobile, ContactsSettingsMenuMobile, ContactsSettingsMobile, ContactsSettingsSecurityMobile

**core** (19): ButtonsIconOutlineActive, ButtonsIconOutlineArrow, ButtonsIconOutlineHover, ButtonsIconOutlineResting, ButtonsIconPrimaryActive, ButtonsIconPrimaryArrow, ButtonsIconPrimaryDisabled, ButtonsIconPrimaryHover, ButtonsIconPrimaryResting, ButtonsLinkButtonActive, ButtonsLinkButtonFocus, ButtonsLinkButtonHover, ButtonsPlainOutlineActiveButton, ButtonsPlainOutlineDisabled, ButtonsPlainOutlineResting, ButtonsPlainPrimaryActive, ButtonsPlainPrimaryDisabled, ButtonsPlainPrimaryHover, ButtonsPlainPrimaryResting

**counters** (7): CountersBarNumericMobile, CountersGraphMobile, CountersIconMobile, CountersIconWeb, CountersNumericWithIconMobile, CountersNumericWithIconWeb, CountersProgress

**dashboard** (3): Dashboard03, Dashboard04, DashboardEmpty

**dataviz** (18): BadgeOval, BadgeRound, ProgressBarsFull, ProgressBarsHigh, ProgressBarsHigh2, ProgressBarsLow, ProgressBarsMedium, ProgressBarsPrimary, ProgressBarsResting, TagsBlue, TagsGreen2, TagsGrey, TagsGreyEditable, TagsLightBlue, TagsPrimary, TagsRed, TagsStatusTag, TagsYellow2

**file-icons** (8): FileIconsAi, FileIconsFolder, FileIconsPdf, FileIconsPhotoshop, FileIconsPowerpoint, FileIconsSketch, FileIconsWord, FileIconsXls

**files** (9): FilesDetails, FilesEmpty, FilesGrid, FilesList, FilesUpload, TablesFilesGridMobile, TablesFilesGridWeb, TablesFilesListMobile, TablesFilesListWeb

**files-mobile** (6): FilesDetailsFullMobile, FilesDetailsHiddenMobile, FilesEmptyMobile, FilesGridMobile, FilesListMobile, FilesUploadMobile

**forms** (20): FormsCheckboxActive, FormsCheckboxError, FormsCheckboxResting, FormsCheckboxSuccess, FormsInputActiveBasic, FormsInputActiveIconOn, FormsInputDisabled, FormsInputInactive, FormsInputStatesError, FormsInputStatesErrorWith, FormsInputStatesSuccess, FormsInputStatesSuccessWith, FormsRadioActive, FormsRadioError, FormsRadioResting, FormsRadioSuccess, FormsSwitchesError, FormsSwitchesOff, FormsSwitchesOn, FormsSwitchesSuccess

**help-center** (7): HelpCenter, HelpCenterExistingTickets, HelpCenterList02Menu, HelpCenterNewTicket, HelpCenterSearch, HelpCenterSearchResults, HelpCenterTickets

**help-center-mobile** (8): HelpCenterList01Mobile, HelpCenterList02MenuMobile, HelpCenterList02Mobile, HelpCenterMobile, HelpCenterNewTicketMobile, HelpCenterSearchEmptyMobile, HelpCenterSearchHiddenMobile, HelpCenterSearchMobile

**invoices** (9): InvoicesDetails, InvoicesEmpty, InvoicesList02, InvoicesNew, InvoicesNewItems, TablesInvoicesRow01Mobile, TablesInvoicesRow01Web, TablesInvoicesRow02Mobile, TablesInvoicesRow02Web

**invoices-mobile** (7): InvoicesAddNewItemsMobile, InvoicesAddNewMenuMobile, InvoicesAddNewMobile, InvoicesDetailsMobile, InvoicesEmptyMobile, InvoicesList01Mobile, InvoicesList02Mobile

**ios-chrome** (4): IOSBarsIndicatorDark, IOSBarsIndicatorLight, IOSBarsStatusBarDark, IOSBarsStatusBarLight

**kanban** (3): Kanban, KanbanDescription, KanbanEmpty

**kanban-mobile** (3): KanbanEmptyMobile, KanbanTaskMobile, KanbanToDoDeskMobile

**messenger** (5): Messages, MessagesAbout, MessagesEmpty, MessagesMedia, MessagesNewMessage

**messenger-mobile** (6): MessagesConversationMenuMobile, MessagesConversationMobile, MessagesEmptyMobile, MessagesListMobile, MessagesMediaMobile, MessagesMenuMobile

**navigation** (20): CraftUILogo, NavigationMobileIconBar, NavigationMobileItemsActive, NavigationMobileItemsResting, NavigationMobileTopBar, NavigationWebFullsizeItemsActive, NavigationWebFullsizeItemsResting, NavigationWebIcons, NavigationWebIconsItemsResting, NavigationWebTopBar, PaginationBoxed, PaginationFullsize, PaginationPrimary, TabsIconActiveTab, TabsIconRestingTab, TabsTextActive, TabsTextActive2, TabsTextResting, TabsTextResting2, UIKitHeader

**notifications** (2): NotificationsGrid, NotificationsList

**notifications-mobile** (2): NotificationsList01Mobile, NotificationsList02Mobile

**products** (17): ProductsAddNew, ProductsEmpty, ProductsGrid01, ProductsGrid02, ProductsItem, ProductsItemCopySaleDetails, ProductsItemSettingsGeneral, ProductsList01, ProductsList02, TablesProductsGrid01Mobile, TablesProductsGrid01Web, TablesProductsGrid02Mobile, TablesProductsGrid02Web, TablesProductsRow01Mobile, TablesProductsRow01Web, TablesProductsRow02Mobile, TablesProductsRow02Web

**products-mobile** (7): ProductDetailsMobile, ProductsAddNewMobile, ProductsEmptyMobile, ProductsGrid01Mobile, ProductsGrid02Mobile, ProductsList01Mobile, ProductsList02Mobile

**projects** (25): ProjectsAddNew, ProjectsDetailsActivity, ProjectsDetailsDesk, ProjectsDetailsFiles, ProjectsDetailsReports, ProjectsDetailsSettings, ProjectsDetailsTasks, ProjectsEmpty, ProjectsGrid01, ProjectsGrid02, ProjectsGrid03, ProjectsList01, ProjectsList02, ProjectsList03, TablesProjectsGrid01Mobile, TablesProjectsGrid01Web, TablesProjectsGrid02Mobile, TablesProjectsGrid02Web, TablesProjectsGrid03Mobile, TablesProjectsGrid03Web, TablesProjectsRow01Mobile, TablesProjectsRow01Web, TablesProjectsRow02Mobile, TablesProjectsRow02Web, TablesProjectsRow03Web

**projects-mobile** (18): ProjectsActivityMobile, ProjectsAddNewMobile, ProjectsDeskMobile, ProjectsDetailsHiddenMobile, ProjectsDetailsMobile, ProjectsEmptyMobile, ProjectsFilesMobile, ProjectsGrid01Mobile, ProjectsGrid02Mobile, ProjectsGrid03Mobile, ProjectsList01Mobile, ProjectsList02Mobile, ProjectsList03Mobile, ProjectsReportsMobile, ProjectsSettingsMenuMobile, ProjectsSettingsMobile, ProjectsSortMobile, ProjectsTasksMobile

**reports** (3): Reports01, Reports02, Reports03

**tasks** (4): Tasks, TasksAddNew, TasksDescription, TasksEmpty

**tasks-mobile** (5): TaskAddNewMobile, TaskDescriptionMobile, TasksEmptyMobile, TasksList01Mobile, TasksList02Mobile

**widgets** (38): ButtonsFilters, ChatsIncomingMsg, ChatsOutgoingMsg, CountersBarNumericWeb, CountersGraphWeb, GraphsBarsHorizontal, GraphsBarsVertical, GraphsGraphSidebar, GraphsOrdersMobile01, GraphsOrdersMobile02, GraphsOrdersMobile03, GraphsOrdersWebGeometric, GraphsOrdersWebWave, GraphsPieSidebarWithCounters, GraphsScheduledMobile, GraphsScheduledWeb, GraphsSingle, GraphsSingleWithCounters, NavigationWebIconsItemsActive, TablesEventsList, TablesInvoicesListWidget, TablesSalesFullwidthListWidget, TablesSalesListWidget, TablesSalesRow01, TablesSalesRow02, TablesSalesSmallListWidget, TablesTasksMobile, TablesTasksWeb, TablesTicketsFullsizeMobile, TablesTicketsFullsizeWeb, TablesTicketsRowMobile, TablesTicketsRowWeb, TabsTextHover, WidgetsGraphsPie, WidgetsSidebarCalendarEvent, WidgetsSidebarEvent, WidgetsSidebarHelp, WidgetsSidebarMessage

**ui_kits/crm-dashboard/screens** (6, full click-through demo assemblies): SignIn, Dashboard02, ContactsList01, MessagesConversation, KanbanState, InvoicesList01

## Component inventory scoping

The Figma file's own metadata inventories 352 "component families" across a flat list of 365 standalone Figma components (0 real component sets — this community kit marks every screen/breakpoint variant as its own Figma "component"). This design system builds:
- **97 true reusable primitives** — buttons, form controls, tags, badges, progress, tabs, pagination, nav rail/top bar, counters, graphs, table widgets, sidebar cards.
- **246 screen-assembly families** — every desktop AND mobile screen variant across every module (Contacts, Messenger, Calendar, Kanban, Tasks, Projects, Products, Invoices, File Browser, Notifications, Reports, Help Center, Dashboard, Auth), including table row/grid sub-widgets and file-type icons.

**3 families remain unbuilt, all confirmed to be duplicate name-labels for components already built under a different name** — not new content. Verified by re-materializing each and checking its Figma node id:
- "Contacts / Profile Overview 01 - Tasks [Mobile]" → node 12070:5080 → already built as `ContactsProfileOverview01Tasks`
- "Tables / Contacts / Grid 02 / Web Mobile" → node 12070:3180 → already built as `TablesContactsGrid02Web`
- "Tables / Projects / Row 03 / Web Mobile" → node 12070:3671 → already built as `TablesProjectsRow03Web`

So effective coverage is **100% of the kit's distinct components** (349 unique nodes; the 3 remaining names are duplicate labels on already-built nodes).

## Intentional additions

- None. Every component above traces to a named layer/component in the source file.

## Fonts

- **Lato** (300/400/700/900) and **Source Sans Pro** (400/600) — loaded from Google Fonts CDN (no font files were attached; these are the exact families used in the source, so no substitution was needed).
- **Line Awesome** icon font — loaded from CDN (jsdelivr). The source embeds `la-solid-900`/`la-regular-400`/`la-brands-400`, which are Line Awesome's exact internal family names.
- Two fonts appear on the file's Cover page only (Inter, DM Sans) — not used in any product screen, so not part of this system.

## Caveats

- Per-character text-style overrides and some deep nested-instance override text weren't fully resolved by the Figma reconstruction; numeric geometry (size/spacing/radius/color) was trusted as exact.
- Icon glyphs render as empty boxes in a few materialized components because the private-use glyph codepoints didn't survive reconstruction — the Line Awesome font/classes are correct and demonstrated separately in `guidelines/brand-icons.card.html`.
- The interactive UI kit (`ui_kits/crm-dashboard`) demonstrates 6 representative screens end-to-end; the other 337 built component/screen families are available as components but not all wired into the click-through demo — ask if you want more screens added to the interactive flow.
- Dark/alternative theme modes exist in the token collection (`fig-tokens.css`) but the source only meaningfully uses the default "Value"/"Main" mode in visible screens — dark mode was not designed for in this pass.
