/* Required */
const swaggerAutogen = require("swagger-autogen");

/* Swagger Doc */
const doc = {
  info: {
    title: "GitrDun API",
    description: "API for to-do list app",
  },
  host:
    process.env.NODE_ENV === "production"
      ? "https://cse341-gitrdun-teamproject.onrender.com"
      : "localhost:8080",
  schemes: [process.env.NODE_ENV === "production" ? "https" : "http"],
};

/* Files */
const outputFile = "./swagger.json";
const endpointFile = ["./routes/index.js"];

/* Run */
swaggerAutogen(outputFile, endpointFile, doc).then(() => {
  console.log("Swagger generated. Run server.");
});
