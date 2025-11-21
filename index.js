/* Required */
const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const routes = require("./routes");

/* Localhost */
const port = process.env.PORT || 8080;

/* Swagger */
const swaggerFile = fs.readFileSync("./swagger.json");
const swaggerDoc = JSON.parse(swaggerFile);

swaggerDoc.host =
  process.env.NODE_ENV === "production"
    ? "https://cse341-gitrdun-teamproject.onrender.com"
    : "localhost:8080";

swaggerDoc.schemes = [process.env.NODE_ENV === "production" ? "https" : "http"];

/* Swagger Route */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

/* Routes */
app.use("/", routes);

/* Listening */
app.listen(port, () => {
  console.log(`app listening on ${port}`);
});
