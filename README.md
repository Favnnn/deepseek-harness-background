# dsh-background

Per-chat background photos for the DeepSeek Harness web GUI. Once you open a chat, its header (title / model / folder / session log row) gains a small button — it opens the background window for **this chat**: pick a photo (shown whole, never upscaled — native quality), drag the frame into a good composition, zoom, dim or lighten it (left = darker, right = lighter), choose the font color — a light color flips the entire UI to its dark Appearance scheme, a dark color to the light one (independent of the Appearance setting), and the text itself takes the exact chosen color. The shell (session list, chat column, header) clears its own background in favor of the photo; inner card surfaces turn to translucent glass. A chat without a photo keeps the ordinary system background. The background window itself carries the panel-glass slider (global, persisted to settings); Settings → Plugins keeps the enable switch and the card language (Auto/EN/RU); the toggle applies live, no restart.

Plugin version: **1.10.0**.

> **Languages / Языки:** English first, the Russian original follows after the divider.

---

## Installation

Requirements: an installed DeepSeek Harness and at least one `pnpm dsh web` run on this PC (so `%DSH_HOME%\profiles\web\` exists; by default `%DSH_HOME%` = `C:\<user>\.dsh`). Windows PowerShell 5.1+ ships with Windows.

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

Or just double-click `install.bat` — it runs the same script and keeps the window open.

The script (run from the plugin folder):

1. Copies the **whole folder** into `%DSH_HOME%\plugins\dsh-background\`. That copy is the live plugin.
2. Adds a managed row to `%DSH_HOME%\profiles\web\cordis.patch.yml` (marked `# dsh-background (managed by install.ps1)`), pointing at `…\plugins\dsh-background\host.mjs`.
3. Rewrites `cordis.patch.yml` in the master folder — an informational copy of the installed row only.

Re-running is safe and idempotent: the copy and the row are refreshed, no duplicates appear. The harness **never reads** the master folder after installation — you may rename, move, or copy it to another PC. If you changed files in the master folder, run `install.ps1` again to refresh the installed copy.

The web profile watches its patch layer (`patchReload: live`), so the host half mounts without a restart. After installing, reload the page (F5). If the button still does not appear, restart `pnpm dsh web` once — the client module registry may have been composed before the row landed. From then on, the Settings → Plugins toggle works live, without any restart, and every future `pnpm dsh web` boot loads the plugin by itself.

## Uninstalling

```powershell
powershell -ExecutionPolicy Bypass -File uninstall.ps1
```

Or double-click `uninstall.bat` — when run from the installed copy it first moves itself to `%TEMP%`, so the plugin folder can delete cleanly.

The script works the same from the master folder and from the installed copy. It removes exactly:

1. The managed row from `%DSH_HOME%\profiles\web\cordis.patch.yml` (by its marker; foreign lines untouched).
2. The installed copy `%DSH_HOME%\plugins\dsh-background\`.
3. The plugin data folder `%DSH_HOME%\plugin-data\dsh-background\` (per-chat configs + uploaded photos).
4. The `chat-background` section from `settings.yaml`.

The master folder is left untouched. Restart `pnpm dsh web` afterwards — the system returns to its pre-plugin state.

## Moving to another PC

1. Copy the whole `dsh-background` folder to the other PC at any path (for example `C:\Tools\dsh-background`).
2. That PC needs the harness installed and `pnpm dsh web` run at least once.
3. Run `powershell -ExecutionPolicy Bypass -File C:\Tools\dsh-background\install.ps1`.
4. Reload the page — the header button is live. Photos are per-machine (stored under `%DSH_HOME%\plugin-data`); re-pick them in each chat.

## How it works

- **host.mjs** — the host half (Node builtins only): registers the `chat-background` settings section (`enabled`, `panelTransparency`, `language`) through the settings service, and mounts `/chat-background/*` routes on the web server: `/state` (all per-chat configs), `/session` (save or remove one chat's config), `/image` (store an uploaded photo, content-addressed, ≤40 MB, png/jpeg/webp/gif/avif) and `GET /image/<id>` (serve the bytes back, immutable cache). State lives in `%DSH_HOME%\plugin-data\dsh-background\state.json` with atomic writes; photos of removed chats are garbage-collected on every save.
- **client.js** — the browser bundle in ModuleLoader format, `React.createElement` only, externals: react, client-store, ui-primitives. It registers four things: `shell.overlay` × 2 (an invisible painter that owns the background layer + the settings window), `conversation.session.header.utilities` (the header button, next to the model / folder / session-log controls), and `settings.plugin.item` (the Settings → Plugins card). The painter inserts a `z-index: -1` photo layer behind the app, makes the shell surfaces translucent through `theme.overrideTokens` (raw palette values captured from the stylesheet, so light/dark and future palettes stay correct), and removes every trace when the switch is off or the chat has no photo.
- **The dialog** — a free window like the agents-board panel: grab its header to move it anywhere; drag the right edge, bottom edge or the corner for width/height (opposite edges stay put — the panel is absolutely placed, no mirroring); position and size persist via localStorage. Default 560px wide; the photo preview area flexes so it always fits the window fully. A **dashed frame inside the preview marks the page viewport** — the photo is only visible on the site inside that rectangle (the area beyond it is dimmed in the preview). Its preview is an exact miniature of the real viewport (same fit, same offsets): drag it to shift the photo, zoom 100–800% (the number fields next to the sliders are type-in editable, as is the hex color), dim/lighten −100…+100 (negative darkens, positive lightens), panels over the photo 0–100% (global — the slider moved here from Settings, still persisted to `settings.yaml`; 0 = panels fully see-through, 100 = opaque system panels; drag right to cover the photo more — the effect also shows live inside the preview as a film over the viewport rect, and dragging coalesces to one repaint per animation frame), custom font color. A chosen font color **flips the whole palette side**: light color → the entire UI renders its dark Appearance scheme (New session plate, composer buttons, borders, chips, menus — everything), dark color → the light scheme, independent of the Appearance setting; the three text tiers take the exact chosen color, while the shell and cards keep mild contrasting veils so the photo stays visible (scaled by the panel slider). Photos show whole and are never upscaled (`object-fit: scale-down` — native resolution quality). **Presets** (second button row): "Save preset" downloads a .zip with the untouched photo bytes plus `chat-background.json` (frame offsets, zoom, dim, font color); "Load preset" applies such a zip to this chat — the photo is re-stored by content hash and the framing appears instantly; zips can be shared between chats and computers. Reset frame, remove photo. Changes apply live on the page and persist on settle.
- **Storage**: the on/off switch, the language and the panel transparency (whose slider now lives in the chat's background window) live in `%DSH_HOME%\settings.yaml` (section `chat-background`); per-chat photos and framing in the plugin's `state.json`. Both survive restarts; the switch applies live through the settings mirror.

## Files

| File | Role |
|---|---|
| `package.json` | manifest: name `dsh-background`, `dsh.client.platform: web`, export `./client` → `client.js` |
| `host.mjs` | host half: the settings section + the `/chat-background/*` state/image routes |
| `client.js` | browser bundle: background painter, header button, per-chat dialog, settings card |
| `install.ps1` | one-run installation (copy into `%DSH_HOME%\plugins\` + the profile-patch row) |
| `uninstall.ps1` | one-run removal (the row + the installed copy + the data folder + the settings section) |
| `install.bat` / `uninstall.bat` | double-click wrappers for the two scripts |
| `cordis.patch.yml` | informational copy of the installed row (rewritten by install.ps1) |
| `README.md` | this file; copied into the installed folder |

## Troubleshooting

- **The header button is missing after installation.** Reload the page (F5); if it stays missing, restart `pnpm dsh web` once. Check: `http://127.0.0.1:3080/chat-background/stats` must answer JSON, and `/plugins/dsh-background/client.js` must be served (not 404). The Settings → Plugins card also shows a Retry button when the page could not read `/state`.
- **The photo uploads but nothing changes.** The host route is alive only while the web server runs the installed host half — restart `pnpm dsh web` once after the first install.
- **I changed client.js / host.mjs in the master folder, nothing changed.** Run `install.ps1` again (the master is not read at runtime) and refresh the page.
- **Text hard to read over a bright photo.** Raise «Panels over the photo» in the chat's background window, drag the «Dim / lighten» slider toward dim, or pick a font color that contrasts with the photo.

---

# Русский (оригинал)

Фото-фоны для отдельных чатов в web GUI DeepSeek Harness. Когда чат открыт и шапка видна (название / модель / папка / лог сессий), рядом появляется кнопка — окно настройки фона **этого чата**: выбрать фото (оно показывается целиком, без обрезки и без растягивания — родное разрешение), перетащить кадр в красивую композицию, приблизить, затемнить или засветить (влево — темнее, вправо — светлее), задать цвет шрифта: перекрашиваются все уровни текста, включая строки «думания» модели, а светлый цвет дополнительно переводит весь интерфейс в тёмную схему оформления (тёмный цвет — в светлую), независимо от настроек Appearance. Оболочка (список сессий, колонка чата, шапка) убирает свой фон полностью, уступая место фото; внутренние карточки становятся полупрозрачным стеклом. Для чата без фото — обычный системный фон. Слайдер прозрачности панелей переехал в окно чата (он глобальный, по-прежнему хранится в настройках); в Settings → Plugins остались переключатель и язык карточки (Авто/EN/RU); всё работает живём, без перезапуска.

## Установка

Требуется: установленный DeepSeek Harness и хотя бы один запуск `pnpm dsh web` на этом ПК (чтобы существовал `%DSH_HOME%\profiles\web\`; по умолчанию `%DSH_HOME%` = `C:\<пользователь>\.dsh`).

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

Или просто дважды кликните `install.bat`.

Скрипт:

1. Копирует **всю папку** в `%DSH_HOME%\plugins\dsh-background\`. Эта копия и есть живой плагин.
2. Добавляет управляемую строку в `%DSH_HOME%\profiles\web\cordis.patch.yml` (маркер `# dsh-background (managed by install.ps1)`).
3. Переписывает `cordis.patch.yml` в мастер-папке — только информационная копия.

Повторный запуск безопасен и идемпотентен. Папка-мастер после установки harness'ом **не читается** — её можно перенести или скопировать на другой ПК. Изменили файлы в мастер-папке — запустите `install.ps1` заново.

Web-профиль следит за своим патч-слоем (`patchReload: live`), host-половина подмонтируется без рестарта. После установки обновите страницу (F5); если кнопки нет — один раз перезапустите `pnpm dsh web`. Дальше плагин подтягивается сам при каждом запуске, а переключатель в Settings → Plugins работает живём.

## Удаление

```powershell
powershell -ExecutionPolicy Bypass -File uninstall.ps1
```

Или двойной клик `uninstall.bat`. Удаляются ровно четыре вещи: управляемая строка в патч-слое, установленная копия, папка данных `%DSH_HOME%\plugin-data\dsh-background\` (конфиги чатов + загруженные фото) и секция `chat-background` в `settings.yaml`. Мастер-папка не трогается. После — перезапустите `pnpm dsh web`: система возвращается в первоначальное состояние.

## Перенос на другой ПК

1. Скопируйте всю папку `dsh-background` на другой ПК в любой путь.
2. Там должен быть установлен harness и хотя бы раз запущен `pnpm dsh web`.
3. Запустите `powershell -ExecutionPolicy Bypass -File C:\Tools\dsh-background\install.ps1`.
4. Обновите страницу — кнопка в шапке работает. Фото хранятся на каждой машине отдельно (`plugin-data`).

## Как это устроено

- **host.mjs** — host-половина (только встроенные модули Node): секция настроек `chat-background` (`enabled`, `panelTransparency`, `language`) и маршруты `/chat-background/*`: `/state`, `/session` (сохранение/удаление конфига чата), `/image` (загрузка фото ≤40 МБ, имя = хэш содержимого), `GET /image/<id>`. Состояние — `plugin-data\dsh-background\state.json` с атомарной записью; осиротевшие файлы фото вычищаются при каждом сохранении.
- **client.js** — клиентский бандл (ModuleLoader, только `React.createElement`). Регистрирует: невидимый «painter» в `shell.overlay` (слой фото с `z-index:-1` + полупрозрачность панелей через `theme.overrideTokens` — исходные цвета палитры читаются из стилевой таблицы, поэтому светлая/тёмная схемы остаются корректными), окно настроек тем же оверлеем, кнопку в `conversation.session.header.utilities` (тот же уровень, что модель/папка/лог), карточку в `settings.plugin.item`. Когда фото нет или плагин выключен — все следы убираются, фон системный.
- **Окно** — свободная панель, как у agents-board: за шапку перетаскиваем в любое место окна, правый край / нижний край / уголок меняют ширину и высоту (противоположные стороны стоят на месте — панель позиционируется абсолютно, без «зеркалирования»); положение и размер запоминаются через localStorage. По умолчанию 560px по ширине; область фото гибко всегда целиком помещается в окне (реплика окна центрируется в ней при любой форме). **Пунктирная рамка внутри превью отмечает вьюпорт страницы** — на сайте фото видно только внутри этого прямоугольника, за его пределами превью затемнено. Превью — точная миниатюра реального окна (тот же кадринг и смещения): перетаскивание сдвигает фото, зум 100–800% (числовые поля рядом с ползунками — и hex цвета — можно вводить с клавиатуры), затемнение/засветка −100…+100 (минус — темнее, плюс — светлее), «Панели поверх фото» 0–100% (глобальный слайдер, переехал из Settings — так же хранится в настройках; 0 = панели полностью прозрачны, 100 = глухие системные панели; вправо — сильнее закрывают фото; эффект сразу виден и в превью плёнкой поверх рамки вьюпорта, а перетаскивание коалесится в один перекрас на кадр), свой цвет шрифта. Выбранный цвет **переключает всю палитру на противоположную сторону**: светлый текст → весь интерфейс в тёмной схеме Appearance (плашка New session, кнопки композера, обводки, чипы, меню — всё), тёмный текст → в светлой; независимо от настроек Appearance. Три уровня текста берут выбранный цвет точно, а корпус и карточки получают лёгкие контрастные покровы, чтобы фото просвечивало (сила — слайдером «Панели поверх фото»). Фото показывается целиком и никогда не растягивается вверх (`object-fit: scale-down` — родное разрешение, без потери качества), пустые поля заполняются базовым цветом показываемой схемы. **Пресеты** (вторая строка кнопок): «Сохранить пресет» скачивает .zip с нетронутыми байтами фото и `chat-background.json` (смещения, зум, затемнение, цвет шрифта); «Загрузить пресет» применяет такой zip к этому чату — фото заново сохраняется по хэшу содержимого, композиция появляется сразу; zip-пресеты можно переносить между чатами и компьютерами. Сброс кадра, убрать фото. Изменения видны сразу, сохраняются на паузе.

## Устранение неполадок

- **Кнопка не появилась.** F5; не помогло — один раз перезапустите `pnpm dsh web`. Проверьте `http://127.0.0.1:3080/chat-background/stats` (должен быть JSON).
- **Фото загрузилось, но фон не изменился.** Значит host-маршруты ещё не живы — перезапустите сервер один раз после первой установки.
- **Менял файлы в мастер-папке — ничего не поменялось.** Это ожидаемо: запустите `install.ps1` заново и обновите страницу.
