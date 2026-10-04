# Отчёт: fail-safe схема dsh-background v2.0.0 (порт на dsh v0.2.0-rc.2)

Файл-справка из проекта dsh-background. Раздел 1 — что изменилось в rc.2 и как
это отражено в плагине. Раздел 2 — как устроено самостоятельное отключение
плагина при поломке. Сibling-документ: `dsh-agents-board/PLUGIN-FAILSAFE-REPORT.md`.

---

## 1. Ловушки rc.1 → rc.2, найденные в живой системе, и их решение здесь

1. **React #130 (primitives)**. Иконки и `Switch` вычищены/переименованы в
   `@deepseek-ai/dsh-client-ui-primitives`. Плагин с v1.11.0 не зависит от
   primitives вовсе (свой `FrameIcon`, свой переключатель); деструктуры
   primitives в бандле нет. Остаточные `require(...primitives)`-пробы (если
   появятся) обязаны лежать в try/catch — проверено симуляцией пустым
   требованием.
2. **`useSessionPendingInteraction` удалён → `uiSession`**. dsh-background
   этими данными не пользуется; painter и диалог читают только `sessions.list`
   и свои store'ы. Все dispatch-хуки (`useSessions`, `useConfig`, `useTp`,
   `useView`) проверяются `typeof props.useXxx === 'function'` — отсутствие
   любого хука деградирует в «фона нет», а не в падение слота.
3. **Бит `completed` строки сессии удалён** (как и `SessionListState.current`).
   Не используется: см. п. 4.
4. **«Текущая сессия»**: rc.1 давал `sessions.current`; в rc.2 его нет.
   Решение — идиома самих компонентов rc.2 (DocumentTitle, WorkspaceBrowser,
   SettingsRoot): просматриваемая сессия — строка `sessions.list`, которую
   удерживает главный вью: `Object.values(byId).find(r => (r.retainedBy.mainView ?? 0) > 0)`;
   строка с `blank: true` (плашка New session) считается «чата нет». Функция
   `pickViewedSession` никогда не бросает; селектор передаётся в `useSessions`.
5. **`sessions.open` → `uiWorkspace.openSession`** — плагином не используется.
6. **`settings.plugin.item` и вкладка Settings→Plugins удалены** → слот
   `plugins.bundle.config`, ключ — **имя пакета** `dsh-background`, `props.view`
   = `'page' | 'summary'`. Переключатель включения — штатный выключатель
   строки на странице Плагины; в конфиг-поля он не дублируется. Поле
   `enabled` из конфига исключено (вместе с действием `setEnabled`).
7. **Настройки rc.2**: host экспортирует schemastery-`Config`
   (`z.object({language, panelTransparency}).volatile()`, загрузка синхронно
   через createRequire: `@deepseek-ai/schemastery`, фолбэк `./deps/schemastery.cjs`
   + вендорный `@deepseek-ai/cosmokit`; без неё плагин работает с дефолтами,
   теряя только форму на странице Плагинов). Клиент: `ctx.configForms.get(NS)`,
   NS = id строки `chat-background`; то же реактивное лицо
   `{status, value, writable, set}`, что было у settingsScope, поэтому диалог
   и rAF-перезапись прозрачности не изменились. Volatile-поля приходят в host
   как `{get()}` — читатель `readConfigValue` понимает обе формы.
8. **Тема rc.2**: поверхности стали полупрозрачными (`--dsw-specific-menu`
   rgba 0.45–0.58). Диалог покрашен «плотной заливкой»
   `linear-gradient(var(--dsw-specific-menu),var(--dsw-specific-menu)) var(--dsw-alias-bg-layer-1,#f8f9fa)`,
   модальный фон — `var(--dsw-alias-bg-mask-3,rgba(0,0,0,.48))`, лyттербокс —
   `--dsw-static-neutral-bluish-00/950` с фолбэками. Остальные токены
   сняты живым инспектором Theme/Slots rc.2.

## 2. Схема самостоятельного отключения

Клиент:
- весь `apply` обёрнут try/catch — rejection entry-модуля в web-shell rc.2
  фатален для всей страницы, поэтому наружу ничего не бросается;
- каждая регистрация слота — через `safeSlot` (`ctx.slots.inject` + try/catch
  внутри фабрики): падение одной регистрации гасит только её, причина —
  в консоли с префиксом `dsh-background:`;
- все обращения к dispatch-хукам — за `typeof`; отсутствующий сервис
  (`configForms`, `theme`) даёт дефолтную область/ручку, а не исключение;
- painter при `background.status !== 'ready'` или пустом кадре полностью
  убирает слой и токен-оверрайды.

Host:
- `apply` обёрнут try/catch, регистрация маршрутов — в собственном try/catch
  с признанием идемпотентных ошибок (`already registered|duplicate|in use`);
- schemastery загружается по двум путям и без него хост живёт (Config не
  экспортируется, форма отсутствует — остальное работает);
- %DSH_HOME% читается через `typeof process`-гарды; state.json — атомарная
  запись с откатом.

Установка/удаление: только официальный поток (`pnpm dsh plugin --profile web
add/remove`); пакование — в `<DSH_HOME>\profiles\<профиль>\.artifacts` из
staging-копии без `*.tgz` (чтобы старые архивы не вкладывались в новый тарбол);
артефакт ПО ССЫЛКЕ ХРАНИТСЯ — манифест профиля ссылается на него `file:`-путём,
а `dsh plugin add`/`remove` любого бандла резолвит ВСЕ зависимости профиля:
отсутствующий артефакт ломает чужие установки (даже их remove). После
успешного add удаляются точечно только устаревшие артефакты СВОЕГО пакета.
Перенос старых настроек до установки; легаси-строки/копии v1 вычищаются, чтобы
не дву-регистрировать пакет (сбой сканера клиент-модулей rc.2).

## 3. Прогон проверок порта (v2.0.0)

1. `node --check client.js` / `host.mjs` — чисто.
2. Симуляции (`tools/port-sim.mjs`, `tools/host-sim.mjs`): 23 + 13 проверок —
   регистрация четырёх слотов, ключ `plugins.bundle.config` = имя пакета,
   лицо хуков, выбор текущей сессии (mainView/blank/пусто), деградация без
   хуков, рендеры painter/диалог/кнопка/карточка (page/summary/loading/readonly),
   запись конфига через scope; volatile-{get()}-конфиг хоста, регистрация
   маршрутов, `/stats`, 404.
3. `pnpm dsh --profile web --dump-config` — строка `chat-background` в профиле.
4. Бандл отдаётся: rev = sha1("plugin-artifact" + NUL + mtime/ctime/size) и
   `GET /plugins/dsh-background/client.js&rev=...` → 200.
5. Живой инспектор `Slots.listSubTree` — регистрации в `shell.overlay`,
   `conversation.session.header.utilities`, `plugins.bundle.config`.
