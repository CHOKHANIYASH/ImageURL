require("dotenv").config();
const app = require("express")();
const cors = require("cors");
const bodyParser = require("body-parser");
const { upload } = require("./middleware");
const { uploadToCloudinary } = require("./cloudinary/cloudinary");
const s3Router = require("./s3/s3Routes");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Welcome");
});
app.use("/s3", s3Router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is listening at port:${PORT}`);
});
