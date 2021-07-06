const express = require("express");
const { connect } = require("mongoose");

const app = express();

//config or meddilware
require("dotenv").config();
const port = process.env.PORT || 8080;
app.use(express.json());

app.use("/", require("./routes"));

const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PP}@cluster0.do0vw.mongodb.net/mydb?retryWrites=true&w=majority`;

connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
  if (err) console.log(err.message);
  else app.listen(port, () => console.log(`server at ${port}`));
});
