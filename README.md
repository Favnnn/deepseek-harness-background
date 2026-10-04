# dsh-background

Per-chat background photos for the DeepSeek Harness web GUI. Once you open a chat, its header (title / model / folder / session log row) gains a small button — it opens the background window for **this chat**: pick a photo (shown whole, never upscaled — native quality), drag the frame into a good composition, zoom, dim or lighten it (left = darker, right = lighter), choose the font color — a light color flips the entire UI to its dark Appearance scheme, a dark color to the light one (independent of the Appearance setting), and the text itself takes the exact chosen color. The shell (session list, chat column, header) clears its own background in favor of the photo; inner card surfaces turn to translucent glass. A chat without a photo keeps the ordinary system background. The background window itself carries the panel-glass slider (global); the **Settings → Plugins page** hosts the bundle's own card: card language (Auto/EN/RU) and the same global slider, and the row's enable switch is the page's native one. Everything applies live, no restart.

Plugin version: **2.0.0** — ported to the **dsh v0.2.0-rc.2** plugin model (profile bundle delivery, schemastery `Config`, `configForms` settings face, `plugins.bundle.config` page slot). Per-chat photos and framing are carried over untouched; the old `settings.yaml` values (language, transparency) are migrated automatically by `install.ps1`.

> **Languages / Языки:** English first, the Russian original follows after the divider.

---

## Installation

Requirements: the harness checkout `C:\Deepseek-Harness\deepseek-harness-v0.2.0-rc.2` (or pass `-HarnessRoot`) and at least one `pnpm dsh web` run on this PC (so `%DSH_HOME%\profiles\web\` exists; by default `%DSH_HOME%` = `C:\<user>\.dsh`). Windows PowerShell 5.1+ ships with Windows.

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

Or just double-click `install.bat` — it runs the same script and keeps the window open.

The script (run from the plugin folder):

1. Vendors the config-schema library from the harness checkout into `deps\` (ships inside the bundle).
2. Removes the legacy `file://` row older (v1) installers wrote into `%DSH_HOME%\profiles\web\cordis.patch.yml` — a leftover would double-register the package and break the rc.2 client-module scan.
3. Removes the legacy installed copy under `%DSH_HOME%\plugins\dsh-background\` (v1 flow artifact).
4. Migrates the v1 `settings.yaml` section (`language`, `panelTransparency`) into the bundle patch defaults.
5. Packs the folder into the profile's `.artifacts` directory (from a staging copy without `*.tgz`) and installs it the only supported way: `pnpm dsh plugin --profile web add <artifact path>` from the harness checkout. The harness records the bundle in the profile manifest — pointing at the `.artifacts` copy — and installs a **real copy** into `%DSH_HOME%\profiles\web\node_modules\dsh-background\`. The `.artifacts` tarball is **kept**: the manifest references it, and `dsh plugin add`/`remove` of ANY bundle resolves every profile dependency, so a deleted artifact would break other plugins' installs. Re-installs delete only outdated artifacts of this package, pointwise.

Re-running is safe and idempotent: everything is refreshed; the user's live row settings are preserved across re-installs. The master folder is **never read at runtime** — the profile holds its own copy, so the master may be moved or deleted freely. After editing the plugin, run `install.ps1` again and refresh the page.

Then **restart `pnpm dsh web`** (if it was running) and hard-refresh the page (F5).

## Uninstalling

```powershell
powershell -ExecutionPolicy Bypass -File uninstall.ps1
```

Or double-click `uninstall.bat`. The script:

1. Runs the official removal: `pnpm dsh plugin --profile web remove dsh-background` from the harness checkout.
2. Removes the legacy managed row (v1 marker) from the profile patch.
3. Removes the legacy installed copy under `%DSH_HOME%\plugins\dsh-background\` (v1 flow).
4. Removes the legacy `chat-background` section from `settings.yaml` (v1 flow).

**The plugin data folder is kept** — `%DSH_HOME%\plugin-data\dsh-background\` (per-chat configs + uploaded photos) survives so an accidental uninstall cannot destroy your pictures. Delete that folder by hand for a clean slate. Restart `pnpm dsh web` afterwards.

## Moving to another PC

1. Copy the whole `dsh-background` folder to the other PC at any path (for example `C:\Tools\dsh-background`).
2. That PC needs the harness checkout (rc.2) and `pnpm dsh web` run at least once.
3. Run `powershell -ExecutionPolicy Bypass -File C:\Tools\dsh-background\install.ps1`.
4. Restart the web server and reload the page — the header button is live. Photos are per-machine (stored under `%DSH_HOME%\plugin-data`); re-pick them in each chat.

## How it works

- **host.mjs** — the host half (Node builtins only). Exports a schemastery **`Config`** (`language`, `panelTransparency`; volatile fields — the fiber is never reloaded on a settings write); the Plugins page generates its form from it, and the client bundle reads the same values through its `configForms` mirror. Mounts `/chat-background/*` routes on the web server: `/state` (all per-chat configs), `/session` (save or remove one chat's config), `/image` (store an uploaded photo, content-addressed, ≤40 MB, png/jpeg/webp/gif/avif) and `GET /image/<id>` (serve the bytes back, immutable cache), plus `/boot` and `/stats` (field diagnostics). State lives in `%DSH_HOME%\plugin-data\dsh-background\state.json` with atomic writes; photos of removed chats are garbage-collected on every save.
- **client.js** — the browser bundle in ModuleLoader format, `React.createElement` only. Injects the rc.2 services `sessions, slots, locale, configForms, theme` and registers four things: `shell.overlay` × 2 (an invisible painter that owns the background layer + the settings window), `conversation.session.header.utilities` (the header button, next to the model / folder / session-log controls) and `plugins.bundle.config` keyed by the package name `dsh-background` (the Plugins-page card). The painter learns the **viewed session** the rc.2 way — the `sessions.list` row the main view retains (`retainedBy.mainView > 0`; a blank "New session" row counts as no session) — and inserts a `z-index: -1` photo layer behind the app, makes the shell surfaces translucent through `theme.overrideTokens` (raw palette values captured from the stylesheet, so light/dark and future palettes stay correct), and removes every trace when the chat has no photo. Every dispatch hook is type-checked and every slot registration is contained: a missing API degrades to "no background", never to a crashed page.
- **The dialog** — a free window like the agents-board panel: grab its header to move it anywhere; drag the right edge, bottom edge or the corner for width/height (opposite edges stay put — the panel is absolutely placed, no mirroring); position and size persist via localStorage. Default 560px wide; the photo preview area flexes so it always fits the window fully. A **dashed frame inside the preview marks the page viewport** — the photo is only visible on the site inside that rectangle (the area beyond it is dimmed in the preview). Its preview is an exact miniature of the real viewport (same fit, same offsets): drag it to shift the photo, zoom 100–800% (the number fields next to the sliders are type-in editable, as is the hex color), dim/lighten −100…+100, panels over the photo 0–100% (global — drag right to cover the photo more; the effect shows live inside the preview as a film over the viewport rect, and dragging coalesces to one repaint per animation frame), custom font color. A chosen font color **flips the whole palette side**: light color → the entire UI renders its dark Appearance scheme, dark color → the light scheme; the three text tiers take the exact chosen color, while the shell and cards keep mild contrasting veils so the photo stays visible. Photos show whole and are never upscaled (`object-fit: scale-down`). **Presets** (second button row): "Save preset" downloads a .zip with the untouched photo bytes plus `chat-background.json` (frame offsets, zoom, dim, font color); "Load preset" applies such a zip to this chat — the photo is re-stored by content hash and the framing appears instantly; zips can be shared between machines and chats.
- **Storage**: the language and the global panel transparency live in the **bundle row config** (defaults from `cordis.patch.yml`, live edits land in the profile — editable both on the Plugins page and in the chat window); per-chat photos and framing in the plugin's `state.json`. Both survive restarts.

## Files

| File | Role |
|---|---|
| `package.json` | manifest: `dsh.bundle.patch`, `dsh.client.platform: web` + client injects, export `./client` → `client.js` |
| `host.mjs` | host half: the `Config` schema + the `/chat-background/*` state/image routes |
| `client.js` | browser bundle: background painter, header button, per-chat dialog, Plugins-page card |
| `cordis.patch.yml` | the bundle row: id `chat-background`, defaults `language: auto`, `panelTransparency: 30` |
| `deps\` | vendored schemastery (CJS) + cosmokit, provisioned by install.ps1 from the checkout `vendor\` |
| `install.ps1` / `uninstall.ps1` | official install (pack + `dsh plugin add`) and removal |
| `install.bat` / `uninstall.bat` | double-click wrappers for the two scripts |
| `tools\` | port-time simulations (not shipped in the tarball) |

## Troubleshooting

- **The header button is missing after installation.** Restart `pnpm dsh web` once, then hard-refresh (F5). Check: `http://127.0.0.1:3080/chat-background/stats` must answer JSON, and the bundle must be served at `/plugins/dsh-background/client.js`. The Plugins-page card shows a Retry button when the page could not read `/state`.
- **The photo uploads but nothing changes.** The host route is alive only while the web server runs the installed host half — restart `pnpm dsh web` once after the first install.
- **I changed client.js / host.mjs in the master folder, nothing changed.** Run `install.ps1` again (the master is not read at runtime) and refresh the page.
- **Text hard to read over a bright photo.** Raise «Panels over the photo» in the chat's background window (or on the Plugins page), drag the «Dim / lighten» slider toward dim, or pick a font color that contrasts with the photo.
- **A console error mentions a slot entry crash.** Each of this plugin's registrations is individually contained — the exact `dsh-background:` reason lands in the console and only that one piece goes dark; the page itself cannot be taken down by the plugin.

---

# Русский (оригинал)

Фото-фоны для отдельных чатов в web GUI DeepSeek Harness. Когда чат открыт и шапка видна (название / модель / папка / лог сессий), рядом появляется кнопка — окно настройки фона **этого чата**: выбрать фото (оно показывается целиком, без обрезки и без растягивания — родное разрешение), перетащить кадр в красивую композицию, приблизить, затемнить или засветить (влево — темнее, вправо — светлее), задать цвет шрифта: перекрашиваются все уровни текста, включая строки «думания» модели, а светлый цвет дополнительно переводит весь интерфейс в тёмную схему оформления (тёмный цвет — в светлую), независимо от настроек Appearance. Оболочка (список сессий, колонка чата, шапка) убирает свой фон полностью, уступая место фото; внутренние карточки становятся полупрозрачным стеклом. Для чата без фото — обычный системный фон. Слайдер прозрачности панелей — в окне чата (он глобальный); на странице **Плагины** у бандла своя карточка: язык (Авто/EN/RU) и тот же глобальный слайдер, а выключатель плагина — штатный, в строке плагина. Всё работает живьём, без перезапуска.

Версия плагина: **2.0.0** — портирован на модель плагинов **dsh v0.2.0-rc.2** (доставка профилем, schemastery-`Config`, лицо настроек `configForms`, слот `plugins.bundle.config`). Фото и кадрирование чатов переносятся как были; старые значения из `settings.yaml` (язык, прозрачность) `install.ps1` переносит автоматически.

## Установка

Требуется: чекаут harness `C:\Deepseek-Harness\deepseek-harness-v0.2.0-rc.2` (или передайте `-HarnessRoot`) и хотя бы один запуск `pnpm dsh web` на этом ПК (чтобы существовал `%DSH_HOME%\profiles\web\`; по умолчанию `%DSH_HOME%` = `C:\<пользователь>\.dsh`).

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

Или просто дважды кликните `install.bat`.

Скрипт:

1. Вендорит библиотеку схем конфигурации из чекаута в `deps\` (едет внутри бандла).
2. Удаляет легаси-строку `file://` в `%DSH_HOME%\profiles\web\cordis.patch.yml` от установок v1 — дубль регистрации ломает сканирование клиент-модулей rc.2.
3. Удаляет легаси-копию из `%DSH_HOME%\plugins\dsh-background\` (артефакт потока v1).
4. Переносит секцию v1 из `settings.yaml` (`language`, `panelTransparency`) в дефолты патча бандла.
5. Пакует папку в каталог `.artifacts` профиля (из staging-копии без `*.tgz`) и ставит единственным поддерживаемым способом: `pnpm dsh plugin --profile web add <путь к артефакту>` из чекаута. Harness вписывает бандл в манифест профиля — со ссылкой на `.artifacts`-копию — и кладёт **настоящую копию** в `%DSH_HOME%\profiles\web\node_modules\dsh-background\`. Тарбол в `.artifacts` **сохраняется**: на него ссылается манифест, а `dsh plugin add`/`remove` любого бандла резолвит все зависимости профиля — удалённый артефакт ломал бы чужие установки. Переустановки удаляют точечно только устаревшие артефакты этого пакета.

Повторный запуск безопасен и идемпотентен: всё обновляется, живые настройки строки сохраняются между переустановками. Мастер-папка **в рантайме не читается** — профиль держит свою копию, мастер можно переносить и удалять. Изменили плагин — запустите `install.ps1` заново и обновите страницу.

Затем **перезапустите `pnpm dsh web`** (если был запущен) и жёстко обновите страницу (F5).

## Удаление

```powershell
powershell -ExecutionPolicy Bypass -File uninstall.ps1
```

Или двойной клик `uninstall.bat`. Скрипт: (1) официальное удаление `pnpm dsh plugin --profile web remove dsh-background` из чекаута; (2) легаси-строка v1 из патч-слоя; (3) легаси-копия из `%DSH_HOME%\plugins\`; (4) легаси-секция `chat-background` в `settings.yaml`.

**Папка данных сохраняется** — `%DSH_HOME%\plugin-data\dsh-background\` (конфиги чатов + загруженные фото) переживает удаление, чтобы случайное удаление не уничтожило ваши картинки. Для чистого листа удалите её вручную. После — перезапустите `pnpm dsh web`.

## Как это устроено

- **host.mjs** — host-половина (только встроенные модули Node). Экспортирует schemastery-**`Config`** (`language`, `panelTransparency`; volatile-поля — запись настроек не перезагружает fiber); страница Плагин генерирует из неё форму, клиентский бандл читает те же значения через зеркало `configForms`. Маршруты `/chat-background/*`: `/state`, `/session` (сохранение/удаление конфига чата), `/image` (загрузка фото ≤40 МБ, имя = хэш содержимого), `GET /image/<id>`, плюс `/boot` и `/stats` (диагностика). Состояние — `plugin-data\dsh-background\state.json` с атомарной записью; осиротевшие файлы фото вычищаются при каждом сохранении.
- **client.js** — клиентский бандл (ModuleLoader, только `React.createElement`). Инжектит сервисы rc.2 `sessions, slots, locale, configForms, theme` и регистрирует: невидимый «painter» в `shell.overlay` (слой фото с `z-index:-1` + полупрозрачность панелей через `theme.overrideTokens` — исходные цвета палитры читаются из стилевой таблицы), окно настроек тем же оверлеем, кнопку в `conversation.session.header.utilities` и карточку `plugins.bundle.config` под ключом-именем пакета `dsh-background`. Painter узнаёт **текущий чат** по-rc.2 — строка `sessions.list`, удерживаемая главным вью (`retainedBy.mainView > 0`; пустая строка «New session» считается «чата нет»). Все dispatch-хуки проверяются на тип, каждая регистрация изолирована: отсутствие API деградирует в «фона нет», но не роняет страницу.
- **Окно** — свободная панель, как у agents-board: за шапку перетаскиваем в любое место окна, правый край / нижний край / уголок меняют ширину и высоту; положение и размер запоминаются через localStorage. По умолчанию 560px по ширине. **Пунктирная рамка внутри превью отмечает вьюпорт страницы**; превью — точная миниатюра реального окна: перетаскивание сдвигает фото, зум 100–800%, затемнение/засветка −100…+100, «Панели поверх фото» 0–100% (глобально; перетаскивание коалесится в один перекрас на кадр), свой цвет шрифта. Выбранный цвет **переключает всю палитру на противоположную сторону**; три уровня текста берут выбранный цвет точно, а корпус и карточки получают лёгкие контрастные покровы. Фото показывается целиком и никогда не растягивается (`object-fit: scale-down`). **Пресеты**: «Сохранить пресет» скачивает .zip с нетронутыми байтами фото и `chat-background.json`; «Загрузить пресет» применяет такой zip к этому чату; zip'ы можно передавать между машинами и чатами.
- **Хранение**: язык и глобальная прозрачность панелей живут в **конфиге строки бандла** (дефолты из `cordis.patch.yml`, живые правки — в профиле; менять можно и на странице Плагины, и в окне чата); фото и кадрирование чатов — в `state.json` плагина. Оба переживают перезапуск.

## Устранение неполадок

- **Кнопка не появилась.** Один раз перезапустите `pnpm dsh web`, затем F5. Проверьте `http://127.0.0.1:3080/chat-background/stats` (должен быть JSON) и что бандл отдаётся по `/plugins/dsh-background/client.js`. На карточке страницы Плагины есть «Повторить», если страница не смогла прочитать `/state`.
- **Фото загрузилось, но фон не изменился.** Значит host-маршруты ещё не живы — перезапустите сервер один раз после первой установки.
- **Менял файлы в мастер-папке — ничего не поменялось.** Это ожидаемо: запустите `install.ps1` заново и обновите страницу.
- **Текст плохо читается на светлом фото.** Поднимите «Панели поверх фото» в окне чата (или на странице Плагины), сдвиньте «Затемнение / засветка» влево или выберите контрастный цвет шрифта.
- **В консоли ошибка про slot entry crashed.** Каждая регистрация плагина изолирована: точная причина с префиксом `dsh-background:` будет в консоли, погаснет только сам этот кусок; страницу плагин уронить не может.
