const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const route = express.Router();

const User = require("../Models/User");

route.get("/", (req, res) => {
  const token = req.headers["token"];
  const decodeToken = jwt.decode(token);
  User.findById(decodeToken.id, (err, data) => {
    if (err) res.status(500).json({ result: false, err });
    else if (!data) {
      res.status(404).json({ result: false, err: { invalidToken: true } });
    } else {
      res.json({
        result: true,
        data: {
          name: data.name,
          email: data.email,
        },
      });
    }
  });
});

route.post("/signup", (req, res) => {
  //validation
  var { name, email, pass } = req.body;
  const err = {};

  if (typeof name !== "string") {
    err.name = "Name is requeird";
  }
  if (typeof email !== "string") {
    err.email = "Email is required";
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    err.email = "Invalid Email";
  }
  if (typeof pass !== "string") {
    err.pass = "Password is Requird";
  } else {
    var hashPass = bcrypt.hashSync(pass, 10);
  }
  if (Object.entries(err).length > 0) {
    return res.status(424).json({ result: false, err });
  }

  //entry to db
  User.findOne({ email }, (err, exist) => {
    if (err) res.status(500).json({ result: false, err });
    else if (exist) {
      res.status(409).json({ result: false, exist: true });
    } else {
      const newUser = new User({ name, email, pass: hashPass });
      newUser.save((err, data) => {
        if (!err) res.json({ result: true, data: { name, email, pass } });
        else res.status(500).json({ result: false, err });
      });
    }
  });
});

route.get("/login", (req, res) => {
  //validation
  var { email, pass } = req.body;
  const err = {};
  if (typeof email !== "string") {
    err.email = "Email is required";
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    err.email = "Invalid Email";
  }
  if (typeof pass !== "string") {
    err.pass = "Password is Requird";
  }
  if (Object.entries(err).length > 0) {
    return res.status(424).json({ result: false, err });
  }

  //search on db
  User.findOne({ email }, (err, data) => {
    if (err) res.status(500).json({ result: false, err });
    else if (data) {
      const compPass = bcrypt.compareSync(pass, data.pass);
      if (compPass) {
        jwt.sign(
          { id: data._id },
          "privetKey",
          { expiresIn: "7d" },
          (err, token) => {
            if (err) res.status(500).json({ result: false, err });
            else res.json({ result: true, token });
          }
        );
      } else {
        res
          .status(404)
          .json({ result: false, err: "Email or Password is worng" });
      }
    } else
      res
        .status(404)
        .json({ result: false, err: "Email or Password is worng" });
  });
  //sent resp
});
module.exports = route;
