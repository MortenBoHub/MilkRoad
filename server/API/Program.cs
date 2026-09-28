using DefaultNamespace.Services;
using Service;

var builder = WebApplication.CreateBuilder(args);

//For products
builder.Services.AddScoped<ProductService>();

//For Users
builder.Services.AddScoped<UserService>();
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
