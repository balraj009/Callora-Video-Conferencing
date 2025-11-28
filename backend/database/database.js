import mongoose from "mongoose";

function connectToDatabase() {
  mongoose
    .connect(process.env.DB_CONNECT)
    .then(() => {
      console.log("Connected to Database");
    })
    .catch((error) => {
      console.error("Error connecting to Database:", error);
    });
}

export default connectToDatabase;
