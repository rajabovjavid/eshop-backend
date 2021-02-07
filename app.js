// require statements
require("dotenv/config");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");

const app = express();

app.use(cors());
app.options("*", cors());

// middleware
app.use(bodyParser.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);

//Routes
const productRouter = require("./routers/product");
const userRouter = require("./routers/user");
const orderRouter = require("./routers/order");
const categoryRouter = require("./routers/category");

const api_url = process.env.API_URL;
app.use(`${api_url}/products`, productRouter);
app.use(`${api_url}/users`, userRouter);
app.use(`${api_url}/orders`, orderRouter);
app.use(`${api_url}/categories`, categoryRouter);

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connection is ready...");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("server is running");
});
