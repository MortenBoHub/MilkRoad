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

## Forcing the FBI raid (for demos)

There is a 1% chance per vendor that a purchase triggers an FBI raid and closes the
vendor. That is great for authenticity but hard to show live, so for demos you can
force it:

1. In `docker-compose.yml`, add `MR_FORCE_FBI: "1"` to the `api` service's
   `environment` block.
2. Apply the change — no rebuild needed, Compose just recreates the container:

   ```sh
   docker compose up -d api
   ```

3. Remove the line and run `docker compose up -d api` again to return to the
   normal 1% chance.

> **This must be set on the `api` container through Compose.**
> `launchSettings.json` only affects running the API locally with `dotnet run` (or
> the IDE); it has no effect inside Docker.

Note: while forced, **every** purchase triggers a raid, so a normal successful
purchase cannot be demonstrated at the same time.

Optional: make it toggleable without editing the file. Add
`MR_FORCE_FBI: ${MR_FORCE_FBI:-}` to the `api` service once, then set the variable
in your shell before recreating the container:

```sh
# bash / zsh / macOS / Linux
MR_FORCE_FBI=1 docker compose up -d api     # force on
docker compose up -d api                    # force off
```

```powershell
# Windows PowerShell
$env:MR_FORCE_FBI = "1"; docker compose up -d api   # force on
$env:MR_FORCE_FBI = "";  docker compose up -d api   # force off
```

## Regenerating the API client

`client/src/api/Api.ts` is generated from the running API with
`swagger-typescript-api`:

```sh
cd client
bun run generateApi           # requires the API on http://localhost:5001
```

This is **never** run during the Docker build: the generated client is committed,
and `--clean-output` would delete the hand-written `client.ts`.
