# Пример архитектуры _Node.js_ + _GraphQL_ приложения

> Написанные ниже практики являются моим личным предпочтением и лишь одним из множества вариантов построения архитектуры. Выбирайте инструменты исходя из ваших задач и вашего опыта.

> Крайне рекомендую для начала ознакомиться с [данным материалом](https://github.com/nodkz/conf-talks/tree/master/articles/graphql/schema-design) (автор – [nodkz](https://github.com/nodkz)), посвящённым практикам проектирования схемы.

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

## Лучшие практики

### Запросы

- Для запросов, возвращающих список объектов, возвращаемый всегда должен быть представлен в виде `[Type!]!`, это позволит:

  - Не выводить в списке `null`, например: `[null, { ... }, null]` – такого не будет.
  - При отсутствии данных к выводу отправлять клиенту пустой массив `[]`, весто `null` (что упрощает работу _Front End_) разработчикам).

```graphql
type Query {
  users: [Users!]!
}

type User {
  # ...
}
```

- Фильтры, сортировку и пагинацию следует выносить в отдельные объекты:

```graphql
type Query {
  articles(
    filter: ArticleFilter,
    # Так же можно указать значения по умолчанию
    page: Int = 1,
    perPage: Int = 10,
    sort: ArticleSort = ArticleSort.CREATED_AT_DESC
  ): [Article!]!
}

enum Language {
  EN
  RU
}

enum ArticleSort {
  TITLE_ASC
  TITLE_DESC
  CREATED_AT_ASC
  CREATED_AT_DESC
}

type ArticleFilter {
  archived: Boolean!
  language: Language!
}

type Article {
  # ...
}
```

### Мутации

- Названия мутаций следует задавать по схеме: `{объект}{Действие}` (в `camelCase`), так как это позволяет проще искать мутации, связанные с конкретной моделью.
- Данные, которые мы хотим отправть на сервер следует вкладывать в объект `input`. В случае, если в дополнение к данным необходимо указать `ID` объекта, то мы передаём его первым аргументом нашей мутации (см. `userUpdate`, `userDelete`).
- При обновлении возвращаем обновлённый объект пользователя.
- При удалении пользователя возвращаем удалённый объект (может пригодится для уведомлений).

```graphql
type Mutation {
  userCreate(input: UserCreateInput!): User!
  userUpdate(id: ID!, input: UserUpdateUnput!): User!
  userDelete(id: ID!): User!
}

type User {
  id: ID!
  # ...
}

input UserCreateInput {
  email: String!
  password: String!
  # ...
}

input UserUpdateInput {
  # ...
}
```

### Обработка ошибок

- Поскольку мы используем [apollo-server](https://www.apollographql.com/docs/apollo-server/), любые ошибки желательно обрабатывать [встроенными обработчиками](https://www.apollographql.com/docs/apollo-server/data/errors/): `AuthenticationError`, `ForbiddenError`, `UserInputError`, `ApolloError`. Но вам ничего не мешает при необходимости создать свой обработчик.
- Для ошибок `UserInputError` в теле ответа следует отправлять дополнительную информацию по полям, не прошедшим валидацию, пример:

```diff
 export const userCreate = async (root: any, args: UserCreateArguments) => {
   const user = User.create({
     email: args.input.email,
     password: args.input.password,
     username: args.input.username,
   });

+ const errors = await validate(user);
+
+ if (errors.length > 0) {
+   throw new UserInputError('Validation failed!', {
+     fields: formatClassValidatorErrors(errors),
+   });
+ }

   return await user.save();
 };
```

## Инструменты

- [Prettier](https://prettier.io/) – форматтер кода, чтобы придерживаться
  одинаковой стилистики кода во всём проекте.

  > Так же вы можете использовать [ESLint](https://eslint.org/): в отличии от [Prettier](https://prettier.io/) он имеет большое количество настроек и систему плагинов. В нашем случае встроенные в [TypeScript](http://www.typescriptlang.org/) средства решают большинство задач линтера.
