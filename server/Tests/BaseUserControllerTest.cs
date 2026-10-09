using API.Controllers;
using DefaultNamespace.Entities;
using DefaultNamespace.Services;
using Microsoft.AspNetCore.Mvc;
using Service;
using Xunit;

namespace Tests;

public class buBaseUserControllerTests
{
    public class FakeUserService : UserService
    {
        public User? UserToReturn { get; set; }

        public FakeUserService() : base(null!)
        {
        }
        
        public decimal? TotalToReturn { get; set; } // for bulk Buy
        

        public override Task<User?> RegisterAsync(string userName, string password)
            => Task.FromResult(UserToReturn);

        private class FakeProductService : ProductService
        {
            public Products? ProductToReturn { get; set; }
            public bool BoolResult { get; set; }
            public Products? CreatedProduct { get; private set; }
            public int? DeletedId { get; private set; }

            public FakeProductService() : base(null!)
            {
            }

            public override Task<Products> CreateAsync(Products product)
            {
                CreatedProduct = product;
                return Task.FromResult(product);
            }

            public override Task<Products?> GetByIdAsync(int id)
                => Task.FromResult(ProductToReturn);

            public override Task<bool> DeleteAsync(int id)
            {
                DeletedId = id;
                return Task.FromResult(true);
            }

            public override Task<bool> SetForSaleAsync(int productId, int userId, bool forSale)
                => Task.FromResult(BoolResult);

            // The controller's Buy calls the multi-product overload.
            public BuyResult? BuyResultToReturn { get; set; }

            public override Task<BuyResult?> BuyAsync(List<int> productIds, int buyerId)
                => Task.FromResult(BuyResultToReturn);
        }

        private static BaseUserController CreateController(
            FakeUserService? users = null, FakeProductService? products = null)
            => new(users ?? new FakeUserService(), products ?? new FakeProductService());

        [Theory]
        [InlineData("Gandalf")]
        [InlineData("Mohammed")]
        [InlineData("William")]
        [InlineData("Tony")]
        public async Task Register_NewUsername_ReturnsOkWithUser(string username)
        {
            var expectedUser = new User();
            var controller = CreateController(new FakeUserService { UserToReturn = expectedUser });

            var result = await controller.Register(new AuthRequest(username, "password123"));

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(expectedUser, ok.Value);
        }

        [Fact]
        public async Task Register_UsernameTaken_ReturnsConflict()
        {
            var controller = CreateController(new FakeUserService { UserToReturn = null });

            var result = await controller.Register(new AuthRequest("Gandalf", "password123"));

            Assert.IsType<ConflictObjectResult>(result.Result);
        }

        [Fact]
        public async Task AddProduct_ValidRequest_CreatesProductForUser()
        {
            var products = new FakeProductService();
            var controller = CreateController(products: products);

            var result = await controller.AddProduct(5, new ProductRequest("Cheese", 9.99m));

            Assert.NotNull(products.CreatedProduct);
            Assert.Equal(5, products.CreatedProduct!.UserId);
            Assert.Equal("Cheese", products.CreatedProduct.ProductName);
            Assert.Equal(9.99m, products.CreatedProduct.Price);
            Assert.Same(products.CreatedProduct, result);
        }

        [Fact]
        public async Task DeleteProduct_ProductDoesNotExist_ReturnsNotFound()
        {
            var products = new FakeProductService { ProductToReturn = null };
            var controller = CreateController(products: products);

            var result = await controller.DeleteProduct(5, 1);

            Assert.IsType<NotFoundResult>(result);
            Assert.Null(products.DeletedId);
        }

        [Fact]
        public async Task DeleteProduct_ProductBelongsToOtherUser_ReturnsNotFoundAndDoesNotDelete()
        {
            var products = new FakeProductService
            {
                ProductToReturn = new Products { Id = 1, UserId = 99 }
            };
            var controller = CreateController(products: products);

            var result = await controller.DeleteProduct(5, 1);

            Assert.IsType<NotFoundResult>(result);
            Assert.Null(products.DeletedId);
        }

        [Fact]
        public async Task DeleteProduct_OwnerDeletes_ReturnsNoContent()
        {
            var products = new FakeProductService
            {
                ProductToReturn = new Products { Id = 1, UserId = 5 }
            };
            var controller = CreateController(products: products);

            var result = await controller.DeleteProduct(5, 1);

            Assert.IsType<NoContentResult>(result);
            Assert.Equal(1, products.DeletedId);
        }

        [Theory]
        [InlineData(true, typeof(NoContentResult))]
        [InlineData(false, typeof(NotFoundResult))]
        public async Task Sell_ReturnsExpectedResult(bool serviceResult, Type expectedType)
        {
            var controller = CreateController(products: new FakeProductService { BoolResult = serviceResult });

            var result = await controller.Sell(5, 1);

            Assert.IsType(expectedType, result);
        }

        [Theory]
        [InlineData(true, typeof(OkObjectResult))]
        [InlineData(false, typeof(NotFoundObjectResult))]
        public async Task Buy_ReturnsExpectedResult(bool success, Type expectedType)
        {
            var buyResult = success
                ? new BuyResult(10m, false, new List<string>())
                : null;
            var controller = CreateController(
                products: new FakeProductService { BuyResultToReturn = buyResult });

            var action = await controller.Buy(5, new BuyRequest(new List<int> { 1 }));

            // ActionResult<T> wraps the underlying IActionResult in .Result.
            Assert.IsType(expectedType, action.Result);
        }
    }
}
