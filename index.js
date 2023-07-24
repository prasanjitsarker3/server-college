const express = require("express")
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
app.use(cors())
app.use(express.json())
//college-server vm64zj9wIAx2HtdK
// DB_USER=college-server
// DB_PASS=vm64zj9wIAx2HtdK


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ujahhqg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        
        await client.connect();

        const collegeCollection = client.db("collegeDataBasePortal").collection("colleges");
        const admissionCollection = client.db("collegeDataBasePortal").collection("admission");
        const feedbackCollection = client.db("collegeDataBasePortal").collection("feedback");
        const usersCollection = client.db("collegeDataBasePortal").collection("users");


        app.get("/colleges", async (req, res) => {
            const query = {};
            const result = await collegeCollection.find(query).toArray();
            res.send(result);
        })
        app.get("/college", async (req, res) => {
            const search = req.query.search;
            const query = { title: { $regex: search, $options: 'i' } };
            const result = await collegeCollection.find(query).toArray();
            res.send(result);
        })
        app.get("/college/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) }
            const result = await collegeCollection.findOne(query)
            res.send(result)
        })

        app.post("/admission", async (req, res) => {
            const admission = req.body;
            const result = await admissionCollection.insertOne(admission);
            res.send(result)
        })
        app.get("/admission", async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await admissionCollection.find(query).toArray();
            res.send(result);
        })
        app.post("/feedback", async (req, res) => {
            const feedback = req.body;
            const result = await feedbackCollection.insertOne(feedback);
            res.send(result)
        })
        app.get("/feedback", async (req, res) => {
            const result = await feedbackCollection.find().toArray();
            res.send(result)
        })

        app.post("/users", async (req, res) => {
            const users = req.body;
            const query = { email: users.email }
            const existing = await usersCollection.findOne(query)
            if (existing) {
                return res.send({ message: "User Already Exist" })
            }
            const result = await usersCollection.insertOne(users)
            res.send(result)
        })
        //use info
        app.get("/users", async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const result = await usersCollection.findOne(query)
            res.send(result);

        })
        app.patch("/updateData/:id", async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateUser = {
                $set: {
                    college: updateData.college,
                    address: updateData.address
                }
            }
            const result = await usersCollection.updateOne(filter, updateUser, options)
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send("College Portal Server is running")
})
app.listen(port, () => {
    console.log(`Port Is Running On Server ${port}`);
})