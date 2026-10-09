using DefaultNamespace.Entities;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

// Public read of the categories; the admin controller is the only writer.
[ApiController]
[Route("api/[controller]")]
public class CategoryController(CategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetAll()
    {
        return Ok(await categoryService.GetAllCategoriesAsync());
    }
}
