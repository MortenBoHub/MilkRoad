using API.Controllers;
using DefaultNamespace.Entities;
using DefaultNamespace.Services;
using Microsoft.AspNetCore.Mvc;
using Service;
using Xunit;

namespace Tests;

public class BaseUserControllerTests
{
    // ---------- Fakes ----------

    public class FakeUserService : UserService
    {
        public User? UserToReturn { get; set; }

        public FakeUserService() : base(null!)
        {
        }

        public override Task<User?> RegisterAsync(string userName, string password)
            => Task.FromResult(UserToReturn);

        /*  public override Task<User?> LoginAsync(string userName, string password)
              => Task.FromResult(UserToReturn);
      } */

        private class FakeProductService : ProductService
        {
            public Products? ProductToReturn { get; set; } // for GetByIdAsync
            public bool BoolResult { get; set; } // for Sell / Buy
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

            public override Task<bool> BuyAsync(int productId, int buyerId)
                => Task.FromResult(BoolResult);
        }

        private static BaseUserController CreateController(
            FakeUserService? users = null, FakeProductService? products = null)
            => new(users ?? new FakeUserService(), products ?? new FakeProductService());

        // ---------- Register ----------

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

        // ---------- Login ----------

     /*   [Fact]
        public async Task Login_ValidCredentials_ReturnsOkWithUser()
        {
            var expectedUser = new User();
            var controller = CreateController(new FakeUserService { UserToReturn = expectedUser });

            var result = await controller.Login(new AuthRequest("Gandalf", "password123"));

            var ok = Assert.IsType<OkObjectResult>(result.Result);
            Assert.Same(expectedUser, ok.Value);
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            var controller = CreateController(new FakeUserService { UserToReturn = null });

            var result = await controller.Login(new AuthRequest("Gandalf", "wrong"));

            Assert.IsType<UnauthorizedResult>(result.Result);
        } */

        // ---------- AddProduct ----------

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

        // ---------- DeleteProduct ----------

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

        // ---------- Sell ----------

        [Theory]
        [InlineData(true, typeof(NoContentResult))]
        [InlineData(false, typeof(NotFoundResult))]
        public async Task Sell_ReturnsExpectedResult(bool serviceResult, Type expectedType)
        {
            var controller = CreateController(products: new FakeProductService { BoolResult = serviceResult });

            var result = await controller.Sell(5, 1);

            Assert.IsType(expectedType, result);
        }

        // ---------- Buy ----------

        [Theory]
        [InlineData(true, typeof(NoContentResult))]
        [InlineData(false, typeof(NotFoundResult))]
        public async Task Buy_ReturnsExpectedResult(bool serviceResult, Type expectedType)
        {
            var controller = CreateController(products: new FakeProductService { BoolResult = serviceResult });

            var result = await controller.Buy(5, 1);

            Assert.IsType(expectedType, result);
        }
    }
}