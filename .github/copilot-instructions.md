## Быстрый контекст для AI-агента — EZImport

Коротко: это Vue 2 Single-File-Component панель для Adobe CEP с набором "host" скриптов (ExtendScript/JSX/TS) для интеграции с разными приложениями (AE, PR, PS, IL). Пакетируется как CEP/ ZXP-панель.

Ключевые зоны кода
- UI — `src/` (основной Vue-приложение): входная точка `src/main.js`, корневой компонент `src/App.vue`, маршруты в `src/router.js`, состояние в `src/store/`.
- Host-скрипты — два места:
  - скомпилированные/шаблонные хост-скрипты в `host/` (тут лежат шаблоны `host.jsx`, `host.ts` для разных приложений);
  - реализованные скрипты, которые собираются бандлером — `src/host/` (например `src/host/AEFT/...`).
- Конфиг сборки — `package.json`, `vue.config.js`, `esbuild.config.js`, `package_scripts/*.js`.

Основные команды (в корне проекта)
- `npm run dev` — переключает в dev (`package_scripts/set-dev.js`) и запускает `vue-cli-service serve` (локальная разработка, использует `public/index-dev.html`).
- `npm run build` — переключает в prod (`package_scripts/set-prod.js`) и запускает сборку `vue-cli-service build` (артефакт — `dist/` => `CSXS/manifest.xml` должен указывать на `dist/index.html`).
- `npm run build:host` — собирает/транспилирует хост-скрипты (см. `esbuild.config.js`).
- `npm run package` — упаковка панели (реализовано в `package_scripts/packaging.js`).
- `npm run switch`, `npm run sign`, `npm run register`, `npm run update`, `npm run help` — команды от `bombino-commands`/`bombino-cmd` (см. `package.json`).

Файлы/места, которые часто нужно править
- `CSXS/manifest.xml` — MainPath переключается между `public/index-dev.html` и `dist/index.html`. Обычно менять не вручную — использовать `npm run switch`.
- `public/` — статичные файлы, `CSInterface.js` и `index-dev.html` / `index.html`.
- `src/host/<APP>/...` — реализация ExtendScript/JSX/TS, например `src/host/AEFT/src/index.js` и `src/host/AEFT/src/import/AE_ImportFile.js`.

Архитектурные паттерны и соглашения (важно копирайтерам и авторам патчей)
- Host API экспонируется в глобальную область ExtendScript: `$.global.AEFT = AEFT;` и дополнительно разворачивается по-функциям — каждая функция также выставляется глобально. См. `src/host/AEFT/src/index.js`.
- Host-скрипты возвращают простые строковые статусы (например: `"ok"`, `"no-file"`, `"unsupported"`, `"rename-fail:..."`) вместо бросания исключений — поддерживайте этот стиль при изменениях.
- Малые утилиты используют имена с префиксом `_` или `AE_` — сохраняйте экспорт/имена, чтобы не ломать глобальную экспозицию и обратную совместимость.
- В `src/host/*/core/*` много «safety» helper-ов: `_opts` (безопасный парсер JSON), `_commitTmp` (переименование временных файлов `__tmp`), `safeName`/`ensureFolder` и т.п. Изменять осторожно — они используются из нескольких host-модулей.
- В UI-коде локали хранятся в `src/locales/ru.json` и `src/locales/en.json` и подключаются в `src/main.js`. Не менять ключи локалей без синхронизации с UI.

Сборка/дебаггинг панели
- Для разработки: `npm run dev` -> открыть целевое приложение Adobe -> Window > Extensions -> выбрать панель. Панель подключается к `localhost:####` (см. терминал). Для CEF debug и ошибок — открыть `index-dev.html` url, смотреть консоль.
- Для production: `npm run build`, затем убедиться, что `CSXS/manifest.xml` указывает на `dist/index.html`, затем `npm run package` для формирования архива/пакета.
- Host-скрипты: если вы меняете код в `src/host/`, выполняйте `npm run build:host` (или смотрите `esbuild.config.js`), чтобы получить обновлённые `host.jsx`/файлы для подпакета.

Конкретные примеры из кода (делайте как в проекте)
- Экспорт host API и разворачивание функций в глобал: `src/host/AEFT/src/index.js` — полезно для понимания как UI вызывает host.
- Парсинг опций: `src/host/AEFT/src/core/jsonUtils.js` — `_opts(o)` возвращает объект или `{}`; предпочитайте эту утилиту при чтении JSON-строк из UI.
- Переименование временных файлов: `src/host/AEFT/src/core/fileOps.js` — `_commitTmp(files)` ожидает объекты ExtendScript `File` с полями `name`, `fsName` и методом `rename`.

Совещения и ограничения для AI-авторов патчей
- Не добавляйте/не включайте `node_modules`, `.git` и прочие скрытые каталоги в итоговый архив; packaging/ sign ломается из-за лишних файлов (это также в README).
- Не меняйте `CSXS/manifest.xml` вручную, если не уверены — используйте `npm run switch` или тестируйте обе конфигурации.
- Сохраняйте совместимость интерфейсов host → UI: UI вызывает глобальные функции по имени; изменение имени функции или сигнатуры сломает интеграцию.

Короткий «контракт» для правок host-файлов
- Вход: строки/пути/объекты ExtendScript (File, FolderItem), JSON-строки опций.
- Выход: строковые статусы или объекты-результаты (сериализуемые), не бросать исключения наружу без обработки.

Куда смотреть при возникновении вопросов
- Реальные host-примеры: `src/host/AEFT/` — копировать стиль и возвращаемые статусы.
- Сборка host: `esbuild.config.js` и скрипт `npm run build:host`.
- Скрипты переключения окружения: `package_scripts/set-dev.js` и `package_scripts/set-prod.js`.

Если что-то неясно — покажите изменённые файлы и примеры вызовов из UI (`src/` → где вызывается `$.global.<...>`). Спросите, нужно ли обновлять `manifest.xml` или `package_scripts`.

---

Пожалуйста, скажите, нужны ли более детальные инструкции по одной из зон (host API, упаковка, или примеры хотфиксов). Я могу сразу уточнить или расширить раздел с примерами вызовов из UI.
