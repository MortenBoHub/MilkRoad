/** The shape the API writes for errors (see server/API/ExceptionHandler.cs). */
interface ProblemDetailsBody {
  title?: string;
  detail?: string;
}

/**
 * Turn whatever the generated client threw into a readable string.
 *
 * `request` rejects with a TypeError on network failure, and with the Response
 * itself on a non-2xx status; the latter carries the ProblemDetails body, which
 * is why this is async.
 */
export async function describeError(error: unknown): Promise<string> {
  if (error instanceof Response) {
    try {
      const body = (await error.clone().json()) as ProblemDetailsBody;
      // `title` is the human message; `detail` holds the server stack trace.
      const message = body.title || body.detail;
      if (message) return message;
    } catch {
      // Empty or non-JSON body — fall through to the status-only message.
    }
    return `API responded with ${error.status} ${error.statusText}`;
  }

  if (error instanceof Error) return error.message;
  return "Unknown error";
}
