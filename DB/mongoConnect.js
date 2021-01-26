const mongoose = require("mongoose");
const config = require("config");

module.exports = () => {
  mongoose.connect(
    `mongodb+srv://${config.get("mUser")}:${config.get(
      "password"
    )}@cluster0-rv00q.gcp.mongodb.net/dealproject?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
      if (err) return console.log(err);
      console.log("Connected to mongo");
    }
  );
};
