import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

dotenv.config();

const SWAGGER_URL = process.env.SWAGGER_URL || "http://localhost";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HostNoc Agent API",
      version: "1.0.0",
      description:
        "API for uploading PDFs, indexing in Pinecone, and storing metadata in MongoDB",
    },
    servers: [
      {
        url: `${SWAGGER_URL}`,
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"], // where to look for annotations
};

export const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};
