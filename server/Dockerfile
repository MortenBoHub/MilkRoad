# Build the .NET API, then run it on the lean ASP.NET runtime image.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore before copying the rest of the source so the layer is cached.
COPY API/API.csproj API/
COPY Service/Service.csproj Service/
COPY Infrastructure/Infrastructure.csproj Infrastructure/
RUN dotnet restore API/API.csproj

COPY . .
RUN dotnet publish API/API.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Npgsql probes for GSSAPI/Kerberos when it connects; without this the driver
# logs a noisy "Cannot load library libgssapi_krb5.so.2" for plain password auth.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app .

ENV ASPNETCORE_URLS=http://+:5001
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5001

# The runtime image ships a non-root "app" user; drop to it.
USER $APP_UID
ENTRYPOINT ["dotnet", "API.dll"]
