const express = require("express");
const cors = require("cors");
const path = require("path");
const fileUpload = require("express-fileupload");
const mongoConnect = require("./DB/mongoConnect");

const app = express();
const port = process.env.PORT || 3033;

mongoConnect();

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin,X-Requested-With,Content-Type,Accept'
//   );
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET,POST,PATCH,PUT,DELETE,OPTIONS'
//   );
//   next();
// });

app.use(cors());
app.use(fileUpload());
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRouter = require("./Routes/userRouter");

app.use("/user", userRouter);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
