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
  accessKeyID: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
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
    const command = new ListObjectsV2Command({ Bucket });
    const response = await client.send(command);
    return response;
  } catch (error) {
    return error;
  }
};
const getObject = async (Bucket, Key) => {
  try {
    const command = new GetObjectCommand({ Bucket, Key });
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
  const s3ObjectUrl = `https://${bucketName}.s3.amazonaws.com/${Key}`;
  return s3ObjectUrl;
};
const getObjectPresignedUrl = async (Bucket, Key) => {
  try {
    const existCommand = new HeadObjectCommand({ Bucket, Key });
    const objectExists = await client.send(existCommand).catch((err) => {
      if (err.name === "NotFound") {
        return false;
      }
    });
    if (!objectExists) return { message: "Object does not exist" };
    const command = new GetObjectCommand({ Bucket, Key });
    const url = await getSignedUrl(client, command);
    return { Key, url };
  } catch (error) {
    return error;
  }
};
const putObject = async (Bucket, Key, path, ContentType) => {
  try {
    const Body = fs.readFileSync(path);
    const command = new PutObjectCommand({ Bucket, Key, Body, ContentType });
    const response = await client.send(command);
    const urlCommand = new GetObjectCommand({ Bucket, Key });
    const url = await getSignedUrl(client, urlCommand);
    fs.unlinkSync(path);
    return { Key, url };
  } catch (error) {
    fs.unlinkSync(path);
    return error;
  }
};
const deleteObject = async (Bucket, Key) => {
  try {
    const command = new DeleteObjectCommand({ Bucket, Key });
    const response = await client.send(command);
    return response;
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
