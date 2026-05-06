using System.Net;
using System.Text.Json;
using EduCollab.Application.Common.Exceptions;

namespace EduCollab.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (BadRequestException ex)
            {
                await WriteErrorAsync(context, HttpStatusCode.BadRequest, ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                await WriteErrorAsync(context, HttpStatusCode.Unauthorized, ex.Message);
            }
            catch (ForbiddenException ex)
            {
                await WriteErrorAsync(context, HttpStatusCode.Forbidden, ex.Message);
            }
            catch (NotFoundException ex)
            {
                await WriteErrorAsync(context, HttpStatusCode.NotFound, ex.Message);
            }
            catch (ConflictException ex)
            {
                await WriteErrorAsync(context, HttpStatusCode.Conflict, ex.Message);
            }

            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");
                await WriteErrorAsync(context, HttpStatusCode.InternalServerError,
                    "An unexpected error occurred.");
            }
        }

        private static async Task WriteErrorAsync(HttpContext ctx, HttpStatusCode status, string message)
        {
            ctx.Response.StatusCode = (int)status;
            ctx.Response.ContentType = "application/json";

            var body = JsonSerializer.Serialize(new { error = message });
            await ctx.Response.WriteAsync(body);
        }
    }
}