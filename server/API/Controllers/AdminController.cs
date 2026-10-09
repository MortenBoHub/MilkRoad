using System.ComponentModel.DataAnnotations;
using DefaultNamespace.Entities;
using DefaultNamespace.Services;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

// User deletion and category CRUD.
// TODO: restrict to admins once authentication exists.
[ApiController]
[Route("api/admin")]
public class AdminController(
    UserService userService,
    CategoryService categoryService,
    ProductService productService) : ControllerBase
{
    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        return await userService.DeleteUserAsync(id)
            ? NoContent()
            : NotFound($"User {id} was not found.");
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<Category>>> GetAllCategories()
    {
        return Ok(await categoryService.GetAllCategoriesAsync());
    }

    [HttpGet("categories/{id:int}")]
    public async Task<ActionResult<Category>> GetCategoryById(int id)
    {
        var category = await categoryService.GetByIdAsync(id);
        return category is null ? NotFound() : Ok(category);
    }

    [HttpPost("categories")]
    public async Task<ActionResult<Category>> CreateCategory(CategoryRequest request)
    {
        var slug = request.Slug.Trim().ToLowerInvariant();

        if (await categoryService.GetBySlugAsync(slug) is not null)
            return Problem(
                title: $"A category with slug '{slug}' already exists.",
                statusCode: 409);

        var category = new Category
        {
            Slug = slug,
            Name = request.Name.Trim(),
            IsAvailable = request.IsAvailable
        };

        await categoryService.CreateAsync(category);
        return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
    }

    [HttpPut("categories/{id:int}")]
    public async Task<ActionResult<Category>> UpdateCategory(int id, CategoryRequest request)
    {
        var category = await categoryService.GetByIdAsync(id);
        if (category is null)
        {
            return NotFound();
        }

        // The slug is deliberately left alone: products are filed under it, so
        // renaming would orphan them.
        category.Name = request.Name.Trim();
        category.IsAvailable = request.IsAvailable;

        await categoryService.UpdateAsync(category);
        return Ok(category);
    }

    [HttpDelete("categories/{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await categoryService.GetByIdAsync(id);
        if (category is null)
        {
            return NotFound();
        }

        if (await productService.AnyInCategoryAsync(category.Slug))
        {
            return Problem(
                title: $"Category '{category.Name}' is in use by products and can't be deleted.",
                statusCode: 409);
        }

        await categoryService.DeleteAsync(id);
        return NoContent();
    }
}

public record CategoryRequest(
    [Required, StringLength(100, MinimumLength = 1)] string Name,
    [Required, StringLength(50, MinimumLength = 1)] string Slug,
    bool IsAvailable = true);
