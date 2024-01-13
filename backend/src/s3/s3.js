const {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const listBuckets = async () => {
  try {
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    return response;
  } catch (error) {
    return error;
  }
};
const listObjects = async (Bucket) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: process.env.S3_BUCKET_FOLDER,
    });
    const response = await client.send(command);
    return response;
  } catch (error) {
    return error;
  }
};
const getObject = async (Bucket, Key) => {
  try {
    const existCommand = new HeadObjectCommand({
      Bucket,
      Key: process.env.S3_BUCKET_FOLDER + "/" + Key,
    });
    const objectExists = await client.send(existCommand).catch((err) => {
      if (err.name === "NotFound") {
        return false;
      }
    });
    if (!objectExists) return { message: "Object does not exist" };
    const command = new GetObjectCommand({
      Bucket,
      Key: process.env.S3_BUCKET_FOLDER + "/" + Key,
    });
    const response = await client.send(command);
    return response;
  } catch (error) {
    return error;
  }
};
const getBucketUrl = async (Bucket) => {
  const bucketName = Bucket;
  const s3BucketUrl = `https://${bucketName}.s3.amazonaws.com`;
  return s3BucketUrl;
};
const getObjectUrl = async (Bucket, Key) => {
  const bucketName = Bucket;
  const s3ObjectUrl = `https://${bucketName}.s3.amazonaws.com/${process.env.S3_BUCKET_FOLDER}/${Key}`;
  return s3ObjectUrl;
};
const getObjectPresignedUrl = async (Bucket, Key) => {
  try {
    const existCommand = new HeadObjectCommand({
      Bucket,
      Key: process.env.S3_BUCKET_FOLDER + "/" + Key,
    });
    const objectExists = await client.send(existCommand).catch((err) => {
      if (err.name === "NotFound") {
        return false;
      }
    });
    if (!objectExists) return { message: "Object does not exist" };
    const command = new GetObjectCommand({
      Bucket,
      Key: process.env.S3_BUCKET_FOLDER + "/" + Key,
    });
    const url = await getSignedUrl(client, command);
    return { Key, url };
  } catch (error) {
    return error;
  }
};
const putObject = async (Bucket, Key, path, ContentType) => {
  try {
    const Body = fs.readFileSync(path);
    const command = new PutObjectCommand({
      Bucket,
      Key: process.env.S3_BUCKET_FOLDER + "/" + Key,
      Body,
      ContentType,
    });
    const response = await client.send(command);
    const url = await getObjectUrl(Bucket, Key);
    fs.unlinkSync(path);
    return { Key, url };
  } catch (error) {
    fs.unlinkSync(path);
    return error;
  }
};
const deleteObject = async (Bucket, Key) => {
  try {
    const existCommand = new HeadObjectCommand({
      Bucket,
      Key: process.env.S3_BUCKET_FOLDER + "/" + Key,
    });
    const objectExists = await client.send(existCommand).catch((err) => {
      if (err.name === "NotFound") {
        return false;
      }
    });
    if (!objectExists) return { message: "Object does not exist" };
    const command = new DeleteObjectCommand({
      Bucket,
      Key: process.env.S3_BUCKET_FOLDER + "/" + Key,
    });
    const response = await client.send(command);
    return { message: "Object deleted Successfully" };
  } catch (error) {
    return error;
  }
};
module.exports = {
  listBuckets,
  listObjects,
  putObject,
  deleteObject,
  getObject,
  getBucketUrl,
  getObjectUrl,
  getObjectPresignedUrl,
};
