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
router.get("/bucket/list", async (req, res) => {
  const response = await listBuckets();
  res.send(response.Buckets);
});

router.get("/object/list", async (req, res) => {
  const response = await listObjects(
    process.env.S3_BUCKET_NAME || req.body.bucket || ""
  );
  res.send(response);
});

router.get("/object/:key", async (req, res) => {
  const response = await getObject(
    process.env.S3_BUCKET_NAME || req.body.bucket || "",
    req.params.key
  );
  if (response.message) res.send(response.message);
  else {
    res.set("content-type", response.ContentType);
    response.Body.pipe(res);
  }
});

router.get("/bucket/url", async (req, res) => {
  const response = await getBucketUrl(
    process.env.S3_BUCKET_NAME || req.body.bucket || ""
  );
  console.log(response);
  res.send(response);
});
router.get("/object/:Key/url", async (req, res) => {
  const response = await getObjectUrl(
    process.env.S3_BUCKET_NAME || req.body.bucket || "",
    req.params.Key
  );
  res.send(response);
});
router.get("/object/:Key/presignedurl", async (req, res) => {
  const response = await getObjectPresignedUrl(
    process.env.S3_BUCKET_NAME || req.body.bucket || "",
    req.params.Key
  );
  res.send(response);
});

router.post("/upload", upload.array("photos"), async (req, res) => {
  const Response = [];
  for (let file of req.files) {
    const filename =
      file.filename.split(".")[0] +
      "_" +
      Date.now() +
      "." +
      file.filename.split(".")[1];
    const response = await putObject(
      process.env.S3_BUCKET_NAME || req.body.bucket || "",
      filename,
      file.path,
      file.mimetype
    );
    Response.push({
      orignalName: file.originalname,
      key: response.Key,
      url: response.url,
    });
  }
  res.send(Response);
});

router.post("/object/:key/delete", async (req, res) => {
  const response = await deleteObject(
    process.env.S3_BUCKET_NAME || req.body.bucket || "",
    req.params.key
  );
  res.send(response);
});

module.exports = router;
