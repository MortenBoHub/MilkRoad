using System.ComponentModel.DataAnnotations;
using DefaultNamespace.Entities;
using DefaultNamespace.Services;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly ProductService _productService;
    private readonly UserService _userService;

    public ProductController(ProductService productService, UserService userService)
    {
        _productService = productService;
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Products>>> GetAll()
    {
        return Ok(await _productService.GetAllProductsAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Products>> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        return product is null ? NotFound() : Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Products>> Create(CreateProductRequest request)
    {
        if (await _userService.GetByIdWithProductsAsync(request.UserId) is null)
        {
            return NotFound($"User {request.UserId} was not found.");
        }

        var product = new Products
        {
            UserId = request.UserId,
            ProductName = request.ProductName.Trim(),
            Price = request.Price
        };

        await _productService.CreateAsync(product);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Products>> Update(int id, UpdateProductRequest request)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        if (product.UserId != request.UserId)
        {
            return Conflict("The product is connected to a different user.");
        }

        product.ProductName = request.ProductName.Trim();
        product.Price = request.Price;

        await _productService.UpdateAsync(product);
        return Ok(product);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        [FromQuery, Range(1, int.MaxValue)] int userId)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        if (product.UserId != userId)
        {
            return Conflict("The product is connected to a different user.");
        }

        await _productService.DeleteAsync(id);
        return NoContent();
    }
}

public record CreateProductRequest(
    [Required, Range(1, int.MaxValue)] int UserId,
    [Required, StringLength(200, MinimumLength = 1)] string ProductName,
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")] decimal Price);

public record UpdateProductRequest(
    [Required, Range(1, int.MaxValue)] int UserId,
    [Required, StringLength(200, MinimumLength = 1)] string ProductName,
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")] decimal Price);
