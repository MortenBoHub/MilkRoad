# Running MilkRoad with Docker

Three containers: **db** (Postgres 17), **api** (.NET 10 + Linq2DB), **web** (Bun + React).

## Start everything

```sh
docker compose up --build
```

- Web app: <http://localhost:3000>
- API / Swagger: <http://localhost:5001/swagger>
- Categories check: <http://localhost:5001/api/Category>

The API waits for Postgres to report healthy, then seeds the categories and the
two demo admins on first start:

| User | Password |
|---|---|
| `AdminMorten` | `123456` |
| `AdminJes` | `123456` |

## Ports

The containers publish:

| Service | Host port | URL |
|---|---|---|
| web | 3000 | <http://localhost:3000> |
| api | 5001 | <http://localhost:5001> |
| db | 5432 | `Host=localhost;Port=5432` |

If you already run the API or web dev server locally (Rider / `bun run dev`), stop
them first, or the publish will fail with "port is already allocated". With the DB
published on 5432 you can also run just the database and point a local API at it:

```sh
docker compose up -d db
```

## Common commands

```sh
docker compose up -d          # start in the background
docker compose logs -f api    # follow the API logs
docker compose down           # stop (keeps the database volume)
docker compose down -v        # stop and wipe the database (reseeds next start)
```

## Configuration

Postgres credentials live in `.env` (dev defaults; not committed). The API reads
its connection string from `ConnectionStrings__Default`, which Compose builds
from those values — no code change needed.

## Regenerating the API client

`client/src/api/Api.ts` is generated from the running API with
`swagger-typescript-api`:

```sh
cd client
bun run generateApi           # requires the API on http://localhost:5001
```

This is **never** run during the Docker build: the generated client is committed,
and `--clean-output` would delete the hand-written `client.ts`.
