const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/userRouter");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const db_link = "mongodb+srv://admin:<password>@cluster0.cjikjz9.mongodb.net/?retryWrites=true&w=majority"

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use("/api", router);

mongoose
  .connect(db_link)
  .then(() => {
    app.listen(5000);
    console.log("Database is connected! Listening to localhost 5000");
  })
  .catch((err) => console.log(err));
