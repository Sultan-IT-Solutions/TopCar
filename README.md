# TopCar

Описание здесь

## Launch

Установите Yarn

```bash
npm install -g yarn
```

Клонируйте репозиторий и установите зависимости:

```bash
git clone https://github.com/Sultan-IT-Solutions/TopCar.git
cd TopCar

yarn install
```

Создайте `.env` файлы для клиента и админки:

**`packages/backend/.env`**

```dotenv
...
```

## Development

Запуск в режиме разработки (одновременно клиент и админка):

```bash
yarn dev
```

Сборка проекта:

```bash
yarn build
```

Запуск в production:

```bash
yarn start
```

Очистка кэша и сборок:

```bash
yarn clean
```