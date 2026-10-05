using API;
using DefaultNamespace.Services;
using Infrastructure;
using LinqToDB;
using LinqToDB.Data;
using Service;

var builder = WebApplication.CreateBuilder(args);
var connectionString = "Data Source=db.db";
var options = new DataOptions().UseSQLite(connectionString);
var DataOptions = new DataOptions<DatabaseConnection>(options); 
//For products
builder.Services.AddScoped<ProductService>();
builder.Services.AddSingleton<IFbiBuyerChance, RandomFbiBuyerChance>();
//For Users
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

//app.MapGet("/", () => "Hello World!");
app.MapControllers();

app.Run();
