/* Required */
const swaggerAutogen = require("swagger-autogen")();

/* Swagger Doc */
const doc = {
  info: {
    title: "GitrDun API",
    description: "API for a to-do list app with list items and users.",0
  },
  host:
    process.env.NODE_ENV === "production"
      ? "cse341-gitrdun-teamproject.onrender.com"
      : "localhost:8080",
  basePath: "/api",
  schemes: [process.env.NODE_ENV === "production" ? "https" : "http"],
  tags: [
    {
      name: "List",
      description:
        "Manage to-do list items in the main inbox and by status (Doing, Done, Delegate).",
    },
    {
      name: "Users",
      description: "Manage application users and their roles.",
    },
  ],
};

/* Files */
const outputFile = "./swagger.json";
const endpointFile = ["./routes/list.js", "./routes/users.js"];

/* Run */
swaggerAutogen(outputFile, endpointFile, doc).then(() => {
  console.log("Swagger generated. Run server.");
});
