const express = require("express");
const _ = require("lodash");
const path = require("path");
const User = require("../Models/User");
const {
  authEmail,
  authSignUp,
  authToken,
  authLogin,
  generateToken,
  pickUserProps,
} = require("../Middleware/auth");

const router = express.Router();
// ------------------------------------------web socket------------------------------------------------------------
const http =require('http').createServer(express)
const io= require('socket.io')(http,{cors:{origin:"*"}})
io.on('connection',(socket)=>{
  console.log('a user connected');

  socket.on('message',(message)=>{
    console.log(message);
    io.emit('message',` ${message}`)
  })
})
http.listen(8080,()=> console.log('listening on http://localhost:8080'))
// -------------------------------------------------------------------------------------------
router.get("/test/", (req, res) => {
  res.json("hello");
});

// ` https://dealsproject.herokuapp.com/user/authToken`
router.get("/authToken", authToken, (req, res) => {
  User.findById(req.body.userId).then((data) => {
    res.json({ logged: true, body: pickUserProps(data) });
  });
});

// ` https://dealsproject.herokuapp.com/user/login`
router.post("/login", authLogin, (req, res) => {
  res.json({
    logged: true,
    body: pickUserProps(req.body.user),
    token: req.body.token,
  });
});

// ` https://dealsproject.herokuapp.com/user/signup`
router.post("/signup", authEmail, authSignUp, (req, res) => {
  User.create(req.body).then((data) => {
    const token = generateToken(data._id, data.email);
    res.json({
      logged: true,
      body: pickUserProps(data),
      token,
    });
  });
});

// ----------------------------------------------------------------------------

//   ` https://dealsproject.herokuapp.com/user/singleProfile/${}`
router.get("/singleProfile/:id", (req, res) => {
  User.findById(req.params.id).then((data) => {
    res.status(200).json(data.profile);
  });
});

// ` https://dealsproject.herokuapp.com/user/updateUserProfile/${}`
router.put("/updateUserProfile/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(400).json({ updated: false, body: "User Not Found" });
  user.profile.resturantName = req.body.resturantName;
  user.profile.city = req.body.city;
  user.profile.street = req.body.street;
  user.profile.phoneNumber = req.body.phoneNumber;
  user.profile.openHour = req.body.openHour;
  user.profile.closeHour = req.body.closeHour;
  user.profile.kosherType = req.body.kosherType;
  user.profile.description = req.body.description;
  await user.save();
  res.status(200).json({ updated: true, body: user.profile });
});

// ` https://dealsproject.herokuapp.com/user/userAvatar/${}`
router.post("/userAvatar/:id", (req, res) => {
  console.log(req.files);
  if (req.files) {
    let myFile = req.files.userAvatar;
    myFile.name = req.params.id
      .concat(".")
      .concat(Math.random())
      .concat(".")
      .concat(myFile.name.split(".").pop());
    myFile.mv("public/img/" + myFile.name, async () => {
      const user = await User.findById(req.params.id);
      if (!user)
        return res
          .status(400)
          .json({ uploaded: false, body: "Server Issue - Try again Later" });
      user.profile.image = `https://dealsproject.herokuapp.com/img/${myFile.name}`;
      await user.save();
      console.log(user.profile.image);
      console.log(user);
      res.status(200).json({
        uploaded: true,
        body: " https://dealsproject.herokuapp.com/img/" + myFile.name,
      });
    });
  } else {
    res.status(400).json({ upladed: false, body: "Image not recieved" });
  }
});

//----------------------------------------------------------------------------

// ` https://dealsproject.herokuapp.com/user/allUsers`
router.get("/allUsers", (req, res, next) => {
  User.find({}).then((data) => {
    res.json(data);
  });
});

// `http://localhost:3033/user/searchUserByName/?resturantName=${}`
router.get("/searchUserByName/", (req, res) => {
  User.find({
    "profile.resturantName": {
      $regex: `.*${req.query.resturantName}.*`,
      $options: "i",
    },
  }).then((data) => {
    res.json(data);
  });
});

// ` https://dealsproject.herokuapp.com/user/removeUser`
router.post("/removeUser", (req, res) => {
  User.deleteOne({ _id: req.body._id }).then((data) => {
    if (data.deletedCount > 0) {
      res.json({ message: "deleted" });
    } else {
      res.status(400).json({ error: "error id not found" });
    }
  });
});

// ----------------------------------------------------------------------

// ` https://dealsproject.herokuapp.com/user/totalDishes`
router.get("/totalDishes", (req, res, next) => {
  User.find({}).then((data) => {
    const allDishes = data.map((item) => item.dishDeals);
    console.log(allDishes);
    res.json(allDishes);
  });
});

// ` https://dealsproject.herokuapp.com/user/allDishesPerUser/${}`
router.get("/allDishesPerUser/:id", (req, res) => {
  User.findById(req.params.id).then((data) => {
    res.status(200).json(data.dishDeals);
  });
});

// ` https://dealsproject.herokuapp.com/user/singleDish/${}/${}`
router.get("/singleDish/:user_id/:dish_id", async (req, res) => {
  const dish = await User.findOne({ _id: req.params.user_id }).select({
    dishDeals: { $elemMatch: { _id: req.params.dish_id } },
  });
  res.json(dish);
});

// ` https://dealsproject.herokuapp.com/user/addDish/${}`
router.post("/addDish/:user_id", async (req, res) => {
  const newdish = {
    name: req.body.name,
    priceBeforeDiscount: req.body.priceBeforeDiscount,
    discount: req.body.discount,
    priceAfterDiscount: req.body.priceAfterDiscount,
    category: req.body.category,
    hoursOfDeal: req.body.hoursOfDeal,
    description: req.body.description,
  };
  await User.updateOne(
    { _id: req.params.user_id },
    { $push: { dishDeals: newdish } }
  );
  const user = await User.findById(req.params.user_id);
  res.json(user);
  //   res.json({ updated: true, body: user.dish });
});

// ` https://dealsproject.herokuapp.com/user/userResturantDishAvatar/${}/${}`
router.post("/userResturantDishAvatar/:user_id/:dish_id", (req, res) => {
  if (req.files) {
    let myFile = req.files.userResturantDishAvatar;
    myFile.name = req.params.dish_id
      .concat(".")
      .concat(myFile.name.split(".").pop());
    myFile.mv("public/img/" + myFile.name, async () => {
      const imageUrl = ` https://dealsproject.herokuapp.com/user/img/${myFile.name}`;
      await User.update(
        {
          _id: req.params.user_id,
          dishDeals: {
            $elemMatch: {
              _id: req.params.dish_id,
            },
          },
        },
        {
          $set: { "dishDeals.$.image": imageUrl },
        }
      );
      const dish = await User.findOne({ _id: req.params.user_id }).select({
        dishDeals: { $elemMatch: { _id: req.params.dish_id } },
      });
      res.json(dish);
    });
  } else {
    res.status(400).json({ upladed: false, body: "Image not recieved" });
  }
});

// ` https://dealsproject.herokuapp.com/user/updateDish/${}/${}`
router.post("/updateDish/:user_id/:dish_id", async (req, res) => {
  if (req.body.error) {
    res.status(400).json(req.body.error.details[0]);
  } else {
    try {
      await User.update(
        {
          _id: req.params.user_id,
          dishDeals: {
            $elemMatch: {
              _id: req.params.dish_id,
            },
          },
        },
        {
          $set: { "dishDeals.$": req.body },
        }
      );
      const dish = await User.findOne({ _id: req.params.user_id }).select({
        dishDeals: { $elemMatch: { _id: req.params.dish_id } },
      });
      res.json(dish);
    } catch {
      res.status(400).json({ message: "Error!! id is not found" });
    }
  }
});

// ` https://dealsproject.herokuapp.com/user/removeDish/${}/${}`
router.post("/removeDish/:user_id/:dish_id", async (req, res) => {
  await User.update(
    { _id: req.params.user_id },
    { $pull: { dishDeals: { _id: req.params.dish_id } } }
  );
  res.json({ message: "deleted" });
});

// --------------------------------------------------------------------------

// ` https://dealsproject.herokuapp.com/user/cartUpdate/${}`
router.put("/cartUpdate/:id", (req, res) => {
  const cart = req.body;
  User.updateOne({ _id: req.params.id }, { cart: cart })
    .then((data) => {
      res.status(200).json({ ok: true, body: "Cart Updated" });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ ok: false, body: "Server Issue - Try again Later" });
    });
});

// ---------------------------------------------------------------------

// ` https://dealsproject.herokuapp.com/user/allOrdersPerUser/${}`
router.get("/allOrdersPerUser/:id", (req, res) => {
  User.findById(req.params.id).then((data) => {
    res.status(200).json(data.shoppingHistory);
  });
});

// ` https://dealsproject.herokuapp.com/user/addOrder/${}`
router.post("/addOrder/:user_id", async (req, res) => {
  const newOrder = {
    code: req.body.code,
    cartList: req.body.cartList,
  };
  await User.updateOne(
    { _id: req.params.user_id },
    { $push: { shoppingHistory: newOrder } }
  );
  const user = await User.findById(req.params.user_id);
  res.json(user);
});

// ----------------------------------------------------------------------
// ` https://dealsproject.herokuapp.com/user/profileByCategory/${}/${}`
router.get("/profileByCategory//", (req, res) => {
  User.findById(req.params.id).then((data) => {
    res.status(200).json(data.profile);
  });
});

// ` https://dealsproject.herokuapp.com/user/dishByCategory/${}/${}`
router.get("/dishByCategory/:category/:hoursOfDeal", async (req, res) => {
  const dish = await User.select({
    dishDeals: { $elemMatch: { _id: req.params.category } },
  });
  res.json(dish);
});
// ` https://dealsproject.herokuapp.com/user/profileByCategory/${}/${}`
router.get("/profileByCategory//", (req, res) => {
  User.findById(req.params.id).then((data) => {
    res.status(200).json(data.profile);
  });
});

// `http://localhost:3033/user/getAllDishesByTwoFilterCH/?category=${}&hoursOfDeal=${}`
// `https://dealsproject.herokuapp.com/user/getAllDishesByTwoFilterCH/?category=${}&hoursOfDeal=${}`
router.get("/getAllDishesByTwoFilterCH/", async (req, res) => {
  const { category, hoursOfDeal, kosherType, city } = req.query;
  const dish = await User.find({
    // "dishDeals.category": { $regex: `.*${category}.*`, $options: "i" },
    // "dishDeals.hoursOfDeal": {
    //   $regex: `.*${hoursOfDeal}.*`,
    //   $options: "i",
    // },
  }).select({
    dishDeals: {
      $elemMatch: {
        $and: [
          {
            category: { $regex: `.*${category}.*`, $options: "i" },
            hoursOfDeal: {
              $regex: `.*${hoursOfDeal}.*`,
              $options: "i",
            },
          },
        ],
      },
    },
  });
  res.status(200).json(dish);
});

// `http://localhost:3033/user/ // $and: [
//   { $elemMatch: { category: filterBycategory } },
//   { $elemMatch: { hoursOfDeal: filterByhoursOfDeal } },
// ],/?kosherType=${}/?city=${}/?category=${}/?hoursOfDeal=${}`

// ` https://dealsproject.herokuapp.com/user/getAllByTwoFilterKC/?kosherType=${}&city=${}`
router.get("/getAllByTwoFilterKC/", async (req, res) => {
  const { kosherType, city } = req.query;
  const resturants = await User.find({
    "profile.kosherType": {
      $regex: `.*${kosherType}.*`,
      $options: "i",
    },
    "profile.city": { $regex: `.*${city}.*`, $options: "i" },
  });
  res.status(200).json(resturants);
});

// // ` https://dealsproject.herokuapp.com/user/getAllByTwoFilterKCC/${}&${}`
// router.get("/getAllByTwoFilterKCC/", (req, res) => {
//   const filterBykosherType = new RegExp(`${req.query.kosherType}`);
//   const filterBycity = new RegExp(`${req.query.city}`);
//   User.find({
//     $and: [
//       { "profile.city": filterBycity },
//       { "profile.kosherType": filterBykosherType },
//     ],
//   }).then((data) => {
//     res.json(data);
//   });
// });

// ------------------------------------------------------------------------------

module.exports = router;
