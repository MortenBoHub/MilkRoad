using Service;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ProductService>();
var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
