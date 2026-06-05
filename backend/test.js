const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://socialadmin:govindvarsha@cluster0.hrxz2rh.mongodb.net/socialpostapp?retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  try {
    const client = new MongoClient(uri);

    await client.connect();

    console.log("MongoDB Connected Successfully");

    await client.close();
  } catch (err) {
    console.error(err);
  }
}

run();