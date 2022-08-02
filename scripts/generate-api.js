const fetch = require("node-fetch");
const dtsgenerator = require("dtsgenerator").default;
const fs = require("fs-extra");

const apiUrl =
  process.argv.filter(arg => arg.toLowerCase().startsWith("http://") || arg.toLowerCase().startsWith("https://"))[0] ||
  "http://lyrio.test/docs-json";

if (!apiUrl) {
  console.error("Usage: node scripts/generate-api.js <url>");
  process.exit(2);
}

const skipTags = ["App", "CORS"];
const namespaceName = "ApiTypes";
const generatedMessage = "// This file is generated automatically, do NOT modify it.\n\n";

function getSchemaName(schema) {
  return schema["$ref"] && schema["$ref"].split("/").pop();
}

function getRequestBodySchemaName(requestBody) {
  return requestBody && getSchemaName(requestBody.content["application/json"].schema);
}

function getResponseSchemaName(responses) {
  const response = Object.values(responses)[0];
  return response.content && getSchemaName(response.content["application/json"].schema);
}

function normalizeModuleName(moduleName, forFilename) {
  if (forFilename) return moduleName.split(" ").join("-").toLowerCase();
  else return moduleName.split(" ").join("");
}

(async () => {
  await fs.remove(__dirname + "/../src/api-generated");
  await fs.ensureDir(__dirname + "/../src/api-generated/modules");

  const api = await (await fetch(apiUrl)).json();

  // Generate types file with dtsgenerator
  const typesFile = await dtsgenerator({
    contents: [api],
    namespaceName
  });
  await fs.writeFile(__dirname + "/../src/api-generated/types.d.ts", generatedMessage + typesFile);

  // Parse OpenAPI definitions
  const tags = {};
  for (const path in api.paths) {
    const operation = api.paths[path];
    const tag = (operation.get || operation.post).tags[0];

    if (skipTags.includes(tag)) continue;

    if (!tags[tag])
      tags[tag] = {
        schemas: new Set(),
        operations: {}
      };

    if (operation.get) {
      const response = getResponseSchemaName(operation.get.responses);
      tags[tag].operations[operation.get.operationId] = {
        type: "get",
        path,
        parameters:
          operation.get.parameters && operation.get.parameters.map(({ name, required }) => ({ name, required })),
        response
      };

      if (response) tags[tag].schemas.add(response);
    } else {
      const body = getRequestBodySchemaName(operation.post.requestBody),
        response = getResponseSchemaName(operation.post.responses);
      tags[tag].operations[operation.post.operationId] = {
        type: "post",
        path,
        body,
        response,
        recaptcha: (operation.post.description || "").startsWith("Recaptcha required.")
      };

      if (body) tags[tag].schemas.add(body);
      if (response) tags[tag].schemas.add(response);
    }
  }

  // Generate ts files
  for (const moduleName in tags) {
    const types = Array.from(tags[moduleName].schemas);
    let code = "";

    code += generatedMessage;
    code += '/// <reference path="../types.d.ts" />\n\n';

    code += 'import { createGetApi, createPostApi } from "@/api";\n\n';

    for (const operationName in tags[moduleName].operations) {
      const operation = tags[moduleName].operations[operationName];
      const path = operation.path.replace("/api/", "");
      const functionName = operationName.split("_").pop();

      if (operation.type === "post") {
        const bodyType = operation.body ? `ApiTypes.${operation.body}` : "void",
          responseType = operation.response ? `ApiTypes.${operation.response}` : "void";
        code += `export const ${functionName} = createPostApi<${bodyType}, ${responseType}>(${JSON.stringify(path)}, ${
          operation.recaptcha
        });\n`;
      } else {
        const parameterTypes =
            operation.parameters &&
            operation.parameters.map(({ name, required }) => `${name}${required ? "" : "?"}: string`).join(", "),
          parameterType = parameterTypes ? `{ ${parameterTypes} }` : "void",
          responseType = operation.response ? `ApiTypes.${operation.response}` : "void";
        code += `export const ${functionName} = createGetApi<${parameterType}, ${responseType}>(${JSON.stringify(
          path
        )});\n`;
      }
    }

    await fs.writeFile(__dirname + `/../src/api-generated/modules/${normalizeModuleName(moduleName, true)}.ts`, code);
  }

  // Generate index file
  let code = "";

  code += generatedMessage;
  for (const moduleName in tags) {
    code += `import * as Imported${normalizeModuleName(moduleName)}Api from "./modules/${normalizeModuleName(
      moduleName,
      true
    )}";\n`;
  }
  code += "\n";
  for (const moduleName in tags) {
    const importedModule = normalizeModuleName(moduleName);
    const exportModule = importedModule.charAt(0).toLowerCase() + importedModule.slice(1);
    code += `export const ${exportModule} = Imported${importedModule}Api;\n`;
  }

  await fs.writeFile(__dirname + `/../src/api-generated/index.ts`, code);
})();
