using System.ComponentModel.DataAnnotations;
using DefaultNamespace.Entities;
using DefaultNamespace.Services;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

/*
 * Delete users
 * CRUD for categories
 */
// TODO: restrict to admins (e.g. [Authorize(Roles = "Admin")]) once authentication exists.
// For now anyone who can reach the API can call these endpoints.
[ApiController]
[Route("api/admin")]
public class AdminController(UserService userService, CategoryService categoryService) : ControllerBase
{
    //  Users 

    [HttpDelete("users/{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        return await userService.DeleteUserAsync(id)
            ? NoContent()
            : NotFound($"User {id} was not found.");
    }

    // Categories

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<Category>>> GetAllCategories()
    {
        return Ok(await categoryService.GetAllCategoriesAsync());
    }

    //Search category 
    [HttpGet("categories/{id:int}")]
    public async Task<ActionResult<Category>> GetCategoryById(int id)
    {
        var category = await categoryService.GetByIdAsync(id);
        return category is null ? NotFound() : Ok(category);
    }
    //create category 
    [HttpPost("categories")]
    public async Task<ActionResult<Category>> CreateCategory(CategoryRequest request)
    {
        var category = new Category
        {
            Name = request.Name.Trim()
        };

        await categoryService.CreateAsync(category);
        return CreatedAtAction(nameof(GetCategoryById), new { id = category.Id }, category);
    }
    
    //Update category
    [HttpPut("categories/{id:int}")]
    public async Task<ActionResult<Category>> UpdateCategory(int id, CategoryRequest request)
    {
        var category = await categoryService.GetByIdAsync(id);
        if (category is null)
        {
            return NotFound();
        }

        category.Name = request.Name.Trim();

        await categoryService.UpdateAsync(category);
        return Ok(category);
    }

    //Delete category 
    [HttpDelete("categories/{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        if (await categoryService.GetByIdAsync(id) is null)
        {
            return NotFound();
        }

        await categoryService.DeleteAsync(id);
        return NoContent();
    }
}

public record CategoryRequest(
    [Required, StringLength(100, MinimumLength = 1)] string Name);