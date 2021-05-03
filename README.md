# Пример архитектуры _Node.js_ + _GraphQL_ приложения

> Написанные ниже практики являются моим личным предпочтением и лишь одним из множества вариантов построения архитектуры. Выбирайте инструменты исходя из ваших задач и вашего опыта.

> Крайне рекомендую для начала ознакомиться с [данным материалом](https://github.com/nodkz/conf-talks/tree/master/articles/graphql/schema-design) (автор – [nodkz](https://github.com/nodkz)), посвящённым практикам проектирования схемы.

## Запуск сервера

Если используем `yarn`:

```sh
yarn
yarn db:migrate
yarn start
```

Если используем `npm`:

```sh
npm install
npm run db:migrate
npm start
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
    # Также можно указать значения по умолчанию
    page: Int = 1,
    perPage: Int = 10,
    sort: ArticleSort = ArticleSort.CREATED_AT_DESC
  ): ArticlePagination!
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

type ArticlePagination {
  items: [Article!]!
  pageInfo: PaginationInfo!
}

type PaginationInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  page: Int!
  perPage: Int!
  totalItems: Int!
  totalPages: Int!
}

type Article {
  # ...
}
```

> Обратите внимание на пагиниацю. Такой подход следует применять ко всем запросам, возвращающим списки.

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

+   const errors = await validate(user);
+
+   if (errors.length > 0) {
+     throw new UserInputError('Validation failed!', {
+       fields: formatClassValidatorErrors(errors),
+     });
+   }

    return await user.save();
  };
```

### N+1

Вот что происходит, когда у нас есть вложенный запрос (например, `получить все посты у пользователей с ID = 1, 2, 3`):

```graphql
query {
  users(ids: [1, 2, 3]) {
    id
    articles {
      id
    }
  }
}
```

```sql
query: SELECT "User"."id" AS "User_id", "User"."email" AS "User_email", "User"."password" AS "User_password", "User"."username" AS "User_username", "User"."bio" AS "User_bio", "User"."image" AS "User_image" FROM "user" "User" WHERE "User"."id" IN (?) -- PARAMETERS: ["1"]
query: SELECT "User"."id" AS "User_id", "User"."email" AS "User_email", "User"."password" AS "User_password", "User"."username" AS "User_username", "User"."bio" AS "User_bio", "User"."image" AS "User_image" FROM "user" "User" WHERE "User"."id" IN (?) -- PARAMETERS: ["2"]
query: SELECT "User"."id" AS "User_id", "User"."email" AS "User_email", "User"."password" AS "User_password", "User"."username" AS "User_username", "User"."bio" AS "User_bio", "User"."image" AS "User_image" FROM "user" "User" WHERE "User"."id" IN (?) -- PARAMETERS: ["3"]
query: SELECT "Article"."id" AS "Article_id", "Article"."title" AS "Article_title", "Article"."slug" AS "Article_slug", "Article"."content" AS "Article_content", "Article"."authorId" AS "Article_authorId" FROM "article" "Article" WHERE "Article"."authorId" = ? -- PARAMETERS: [1]
query: SELECT "Article"."id" AS "Article_id", "Article"."title" AS "Article_title", "Article"."slug" AS "Article_slug", "Article"."content" AS "Article_content", "Article"."authorId" AS "Article_authorId" FROM "article" "Article" WHERE "Article"."authorId" = ? -- PARAMETERS: [2]
query: SELECT "Article"."id" AS "Article_id", "Article"."title" AS "Article_title", "Article"."slug" AS "Article_slug", "Article"."content" AS "Article_content", "Article"."authorId" AS "Article_authorId" FROM "article" "Article" WHERE "Article"."authorId" = ? -- PARAMETERS: [3]
```

Чтобы решить эту проблему, следует воспользоваться библиотекой [dataloader](https://github.com/graphql/dataloader):

```diff
+ import Dataloader from 'dataloader';
+
- import { User, Article } from '../../entities';
+ import { User } from '../../entities';

+ const getArticlesOfUsers = async (ids: any[]) => {
+   const users = await User.createQueryBuilder('user')
+     .leftJoinAndSelect('user.articles', 'article')
+     .where('user.id IN (:...ids)', { ids })
+     .leftJoinAndSelect('article.author', 'author')
+     .getMany();

+
+   return users.map((user) => user.articles);
+ };
+
+ const articlesLoader = new Dataloader((keys) => getArticlesOfUsers(keys));
+
  export const users = async (root: any, args: { ids: UserID[] }) => {
-   const users = args.ids.map(async (id) => {
-     const user = await User.findOne(id);
-
-     return {
-       ...user,
-       articles: await Article.find({ author: user }),
-     };
-   });

+   const users = args.ids.map((id) => {
+     return articlesLoader.load(id);
+   });

    return users;
  };
```

На выходе мы вмето **6 запросов мы получаем 1 (!)**. И, следовательно, решённую `N+1` проблему:

```sql
query: SELECT "user"."id" AS "user_id", "user"."email" AS "user_email", "user"."password" AS "user_password", "user"."username" AS "user_username", "user"."bio" AS "user_bio", "user"."image" AS "user_image", "article"."id" AS "article_id", "article"."title" AS "article_title", "article"."slug" AS "article_slug", "article"."content" AS "article_content", "article"."authorId" AS "article_authorId", "author"."id" AS "author_id", "author"."email" AS "author_email", "author"."password" AS "author_password", "author"."username" AS "author_username", "author"."bio" AS "author_bio", "author"."image" AS "author_image" FROM "user" "user" LEFT JOIN "article" "article" ON "article"."authorId"="user"."id"  LEFT JOIN "user" "author" ON "author"."id"="article"."authorId" WHERE "user"."id" IN (?, ?, ?) -- PARAMETERS: ["1","2","3"]
```

> На самом деле всего этого можно было бы избежать, используя [Prisma](https://www.prisma.io/) в качестве ORM, так как она умеет решать эту проблему "из коробки" :).

## Инструменты

- [Prettier](https://prettier.io/) – форматтер кода, чтобы придерживаться
  одинаковой стилистики кода во всём проекте.

  > Также вы можете использовать [ESLint](https://eslint.org/): в отличии от [Prettier](https://prettier.io/) он имеет большое количество настроек и систему плагинов. В нашем случае встроенные в [TypeScript](http://www.typescriptlang.org/) средства решают большинство задач линтера.
