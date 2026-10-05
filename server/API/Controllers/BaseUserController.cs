using System.ComponentModel.DataAnnotations;
using DefaultNamespace.Entities;
using DefaultNamespace.Services;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

public record AuthRequest(string UserName, string Password);
public record ProductRequest(string ProductName, decimal Price);

public record BuyRequest([Required, MinLength(1)] List<int> ProductIds);
/*
 * Username
 * Login
 * buying
 * Selling
 * Manage their inventory
 * CRUD for their products
 */
[ApiController]
[Route("api/users-actions")]
public class BaseUserController(UserService userService, ProductService productService) : ControllerBase
{
    //Username + Login
    [HttpPost(nameof(Register))]
    public async Task<ActionResult<User>>Register(AuthRequest request)
    {
        var user = await userService.RegisterAsync(request.UserName, request.Password);
            return user is null ? Conflict("User name already exists") : Ok(user);
    }
    

  [HttpPost(nameof(Login))]
  public async Task<ActionResult<User>> Login(AuthRequest request)
  {
      var user = await userService.LoginAsync(request.UserName, request.Password);
      return user is null ? Unauthorized() : Ok(user);
  }
  
  //Manage inventory 
  [HttpGet(nameof(GetProduct))]
  public async Task<Products> GetProduct(int userId, ProductRequest request)
  {
      return await productService.CreateAsync(new Products
      {
          UserId = userId,
          ProductName = request.ProductName,
          Price = request.Price
      });
  }
  
  //Crud product
  
  //Add
  [HttpPost(nameof(AddProduct))]
  public async Task<Products> AddProduct(int userId, ProductRequest request)
  {
      return await productService.CreateAsync(new Products
      {
          UserId = userId,
          ProductName = request.ProductName,
          Price = request.Price
      });
  }

  
  //Delete 
  [HttpDelete(nameof(DeleteProduct))]
  public async Task<IActionResult> DeleteProduct(int userId, int productId)
  {
      var product = await productService.GetByIdAsync(productId);
      if (product is null || product.UserId != userId) return NotFound();

      await productService.DeleteAsync(productId);
      return NoContent();
  }
  
//selling
  [HttpPost(nameof(Sell))]
  public async Task<IActionResult> Sell(int userId, int productId)
  {
      return await productService.SetForSaleAsync(productId, userId, true) ? NoContent() : NotFound();
  }
  
  
  //Buying 
  [HttpPost(nameof(Buy))]
  public async Task<IActionResult> Buy(int buyerId, BuyRequest request)
  {
      var total = await productService.BuyAsync(request.ProductIds, buyerId);
      return total is null
          ? NotFound("No products found")
          : Ok(new { total });
  }
  
}