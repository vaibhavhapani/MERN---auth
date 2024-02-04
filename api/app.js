const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/userRouter");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use("/api", router);

mongoose
  .connect(
    "mongodb+srv://admin:bNSUoN05xzqwzhiS@cluster0.cjikjz9.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
    console.log("Database is connected! Listening to localhost 5000");
  })
  .catch((err) => console.log(err));
