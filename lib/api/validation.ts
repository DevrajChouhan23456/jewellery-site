import { z } from "zod";

export const INVALID_JSON_BODY_MESSAGE = "Request body must be valid JSON.";

type JsonBodyParseResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      kind: "json";
      message: string;
    }
  | {
      success: false;
      kind: "validation";
      error: z.ZodError<T>;
    };

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema,
): Promise<JsonBodyParseResult<z.infer<TSchema>>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      kind: "json",
      message: INVALID_JSON_BODY_MESSAGE,
    };
  }

  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return {
      success: false,
      kind: "validation",
      error: parsed.error,
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

export function toFormattedBodyError(message: string) {
  return {
    _errors: [message],
  };
}

export function getZodErrorMessage(
  error: z.ZodError,
  fallback = "Invalid request body.",
) {
  const issue = error.issues[0];

  if (!issue) {
    return fallback;
  }

  const path = issue.path.map(String).join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}

export function getZodErrorMessages(
  error: z.ZodError,
  limit = 5,
) {
  return error.issues.slice(0, limit).map((issue) => {
    const path = issue.path.map(String).join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

type ImageFileSchemaOptions = {
  requiredMessage?: string;
  invalidTypeMessage?: string;
  maxSize?: number;
  maxSizeMessage?: string;
  allowEmptyType?: boolean;
};

export function createImageFileSchema(options: ImageFileSchemaOptions = {}) {
  const {
    requiredMessage = "Please choose an image file.",
    invalidTypeMessage = "Only image uploads are supported.",
    maxSize,
    maxSizeMessage,
    allowEmptyType = true,
  } = options;

  const schema = z
    .custom<File>((value): value is File => value instanceof File, {
      message: requiredMessage,
    })
    .refine((file) => file.size > 0, requiredMessage)
    .refine(
      (file) =>
        allowEmptyType ? !file.type || file.type.startsWith("image/") : file.type.startsWith("image/"),
      invalidTypeMessage,
    );

  if (typeof maxSize !== "number") {
    return schema;
  }

  return schema.refine(
    (file) => file.size <= maxSize,
    maxSizeMessage ?? `Images must be ${maxSize} bytes or smaller.`,
  );
}
