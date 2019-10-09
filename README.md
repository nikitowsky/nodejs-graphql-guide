# Пример архитектуры _Node.js_ + _GraphQL_ приложения

> Написанные ниже практики являются моим личным предпочтением и лишь одним из множества вариантов построения архитектуры. Выбирайте инструменты исходя из ваших задач и вашего опыта.

## Начинаем работу

Для начала нужно запустить базу данных _PostgreSQL_:

```sh
docker-compose up --build
```

Затем, запустить наш сервер в режиме разработки:

```sh
yarn start
```

## Структура проекта

- `src/index.ts` – входная точка приложения.
- `src/entities` – [TypeORM](https://typeorm.io/#/) объявления схемы базы данных.
- `src/migrations` – [TypeORM](https://typeorm.io/#/) миграции схемы базы данных.

  > В экосистеме _Node.js_ существует множество решений для работы с базами данных, начиная от [Sequelize](https://sequelize.org/) для _SQL_ и [Mongoose](https://mongoosejs.com/) для _MongoDB_, заканчивая современным подходом использующимся в [Prisma](https://www.prisma.io/).

- `src/graphql` – все файлы, относящиеся к _GraphQL_.
- `src/graphql/resolvers` – [функции](https://www.apollographql.com/docs/graphql-tools/resolvers/), описывающие работу с данными, описанных в схеме.
- `src/graphql/schema.ts` – схема _GraphQL_, описанная в стиле [SDL (Schema
  Definition Language)](https://graphql.org/learn/schema/).

  > Однако не обязательно использовать отдельный язык для описание схемы данных: схему можно описывать _code-first_ методом, например, при помощи [Nexus](https://nexus.js.org/) или оригинальной реализации стандарта _GraphQL_ под _JavaScript_ – [graphql.js](https://graphql.org/graphql-js/type/).

---

- `.prettierrc` – файл конфигурации [Prettier](https://prettier.io/).
- `ormconfig.json` – файл конфигурации [TypeORM](https://typeorm.io/#/) (**следует добавить в _.gitignore_ в вашем проекте**).
- `package.json` – основа почти любого `Node.js`-проекта :).
- `tsconfig.json` - файл конфигурации [TypeScript](http://www.typescriptlang.org/).

## Инструменты

- [Prettier](https://prettier.io/) – форматтер кода, чтобы придерживаться
  одинаковой стилистики кода во всём проекте.

  > Так же вы можете использовать [ESLint](https://eslint.org/): в отличии от [Prettier](https://prettier.io/) он имеет большое количество настроек и систему плагинов. В нашем случае встроенные в [TypeScript](http://www.typescriptlang.org/) средства решают большинство задач линтера.
