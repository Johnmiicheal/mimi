import { createRequire } from 'module';
import { zodToJsonSchema } from 'zod-to-json-schema';

const require = createRequire(import.meta.url);

type ZodCjsModule = {
  toJSONSchema?: (schema: unknown, options?: Record<string, unknown>) => unknown;
  z?: {
    toJSONSchema?: (schema: unknown, options?: Record<string, unknown>) => unknown;
  };
  default?: {
    toJSONSchema?: (schema: unknown, options?: Record<string, unknown>) => unknown;
    z?: {
      toJSONSchema?: (schema: unknown, options?: Record<string, unknown>) => unknown;
    };
  };
};

const zodModule = require('zod') as ZodCjsModule;

const compatToJSONSchema = (schema: unknown, options?: Record<string, unknown>) => {
  return zodToJsonSchema(schema as never, options);
};

if (typeof zodModule.toJSONSchema !== 'function') {
  zodModule.toJSONSchema = compatToJSONSchema;
}

if (zodModule.z && typeof zodModule.z.toJSONSchema !== 'function') {
  zodModule.z.toJSONSchema = compatToJSONSchema;
}

if (zodModule.default && typeof zodModule.default.toJSONSchema !== 'function') {
  zodModule.default.toJSONSchema = compatToJSONSchema;
}

if (zodModule.default?.z && typeof zodModule.default.z.toJSONSchema !== 'function') {
  zodModule.default.z.toJSONSchema = compatToJSONSchema;
}

export {};
