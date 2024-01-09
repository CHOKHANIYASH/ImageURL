const router = require("express").Router();
const { upload } = require("../middleware");
const {
  listBuckets,
  putObject,
  listObjects,
  deleteObject,
  getObject,
  getBucketUrl,
  getObjectUrl,
  getObjectPresignedUrl,
} = require("./s3");
const fs = require("fs");
router.get("/listbuckets", async (req, res) => {
  const response = await listBuckets();
  res.send(response.Buckets);
});

router.get("/listobjects/", async (req, res) => {
  const response = await listObjects(
    process.env.S3_BUCKET_NAME || req.body.bucket || ""
  );
  res.send(response);
});

router.get("/getobject/:key", async (req, res) => {
  const response = await getObject(
    process.env.S3_BUCKET_NAME || req.body.bucket || "",
    req.params.key
  );
  res.set("content-type", response.ContentType);
  response.Body.pipe(res);
});

router.get("/getbucketurl", async (req, res) => {
  const response = await getBucketUrl(
    process.env.S3_BUCKET_NAME || req.body.bucket || ""
  );
  console.log(response);
  res.send(response);
});
router.get("/getobjecturl/:Key", async (req, res) => {
  const response = await getObjectUrl(
    process.env.S3_BUCKET_NAME || req.body.bucket || "",
    req.params.Key
  );
  res.send(response);
});
router.get("/getobjectpresignedurl/:Key", async (req, res) => {
  const response = await getObjectPresignedUrl(
    process.env.S3_BUCKET_NAME || req.body.bucket || "",
    req.params.Key
  );
  res.send(response);
});

router.post("/upload", upload.array("photos"), async (req, res) => {
  const Response = [];
  for (let file of req.files) {
    const response = await putObject(
      process.env.S3_BUCKET_NAME || req.body.bucket || "",
      file.filename,
      file.path,
      file.mimetype
    );
    Response.push({
      orignalName: file.originalname,
      Key: file.filename,
      url: response.url,
    });
  }
  res.send(Response);
});

router.post("/deleteobject", async (req, res) => {
  const response = await deleteObject(
    process.env.S3_BUCKET_NAME || req.body.bucket || "",
    req.body.key
  );
  res.send("Object deleted successfully");
});

module.exports = router;
