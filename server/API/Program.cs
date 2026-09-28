using DefaultNamespace.Services;
using LinqToDB;
using Service;

var builder = WebApplication.CreateBuilder(args);
var connectionString = "Data Source=db.db";
var options = new DataOptions().UseSQLite(connectionString);
//set up database
//For products
builder.Services.AddScoped<ProductService>();
//For Users
builder.Services.AddScoped<UserService>();
//add scope database
//add scope seeder
builder.Services.AddOpenApiDocument();
builder.Services.AddProblemDetails();
//set up exception handler
builder.Services.AddControllers();
builder.Services.AddCors();

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors(config => config.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowed(_ => true));
app.UseOpenApi();
app.UseSwaggerUi();

//set up scope

//app.MapGet("/", () => "Hello World!");
app.MapControllers();

app.Run();
