const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://mobile:${process.env.MONGODB_URI_PASS}@cluster0.1zdgrcr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});
console.log("database going on ", uri)


async function run() {

    try {
        await client.connect()
        const usersCollection = client.db('mobile').collection('users')
        const productsCollection = client.db('mobile').collection('products')


        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true }
            const doc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(filter, doc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
            res.send({ result, token })
        })


        //   Post A product to database...
        app.post('/product', async (req, res) => {
            const query = req.body;
            const result = await productsCollection.insertOne(query)
            res.send(result)
        })
        //   get a product from database...
        app.get('/getProduct', async (req, res) => {
            const query = {};
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })
        //   Post A product to database...
        app.put('/update/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            const query = req.body;
            const filter = { _id: id }
            const options = { upsert: true };
            const doc = {
                $set: query
            }
            const result = await productsCollection.updateOne(filter, doc, options)
            res.send(result)

        })
        //   delete a product from database...
        app.delete('/delete/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            const filter = { _id: id }
            const result = await productsCollection.deleteOne(filter);
            res.send(result)
        })

    }
    finally {


    }


}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello World! Welcome to mobile server')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
