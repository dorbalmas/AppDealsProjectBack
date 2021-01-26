const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProfileSchema = new Schema(
  {
    resturantName: { type: String, default: "fat cow" },
    city: { type: String, default: "herzelia" },
    street: { type: String, default: "12 Main St." },
    phoneNumber: { type: String, default: "0545407392" },
    openHour: { type: String, default: "12:00" },
    closeHour: { type: String, default: "00:00" },
    kosherType: { type: String, default: "kosher" },
    description: { type: String, default: "the best resturant in your area!" },
    image: {
      type: String,
      default: "https://dealsproject.herokuapp.com/img/default-avatar.jpg",
    },
  },
  { _id: false }
);

const Profile = mongoose.model("Profile", ProfileSchema);

exports.ProfileSchema = ProfileSchema;
exports.Profile = Profile;
