using API;
using DefaultNamespace.Services;
using Infrastructure;
using LinqToDB;
using LinqToDB.Data;
using Service;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Host=localhost;Port=5432;Database=milkroad;Username=milkroad;Password=milkroad";
var options = new DataOptions().UsePostgreSQL(connectionString);
var DataOptions = new DataOptions<DatabaseConnection>(options);
builder.Services.AddScoped<ProductService>();
builder.Services.AddSingleton<IFbiBuyerChance, RandomFbiBuyerChance>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<DatabaseConnection>(_ => new DatabaseConnection(DataOptions));
builder.Services.AddScoped<Seeder>();
builder.Services.AddScoped<DataConnection>(sp => sp.GetRequiredService<DatabaseConnection>());
builder.Services.AddOpenApiDocument();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ExceptionHandler>();
builder.Services.AddControllers();
builder.Services.AddCors();
builder.Services.AddScoped<CategoryService>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors(config => config.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowed(_ => true));
app.UseOpenApi();
app.UseSwaggerUi();

using (var scorp = app.Services.CreateScope())
{
    var seeder = scorp.ServiceProvider.GetService<Seeder>();
    seeder.seed();
}

app.MapControllers();

app.Run();
