const express = require('express')
var cors = require('cors')
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()
const objectId = require('mongodb').ObjectId
const jwt = require('jsonwebtoken');

// motorService
// ODe3mv5G3bMyUIWp

app.use(cors())
app.use(express.json())

//function for check jwt
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: "forbidden access" })
        }
        console.log('decoded', decoded)
        req.decoded = decoded
        next()
    })

}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8xa4t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//node curd operation

async function run() {
    try {
        await client.connect()
        const serviceCollection = client.db("motorServices").collection("service");

        const orderCollection = client.db("motorServices").collection("order");



        //heroku deploy test
        app.get('/hero', (req, res) => {
            res.send('THere is no hero')
        })

        //auth jwt token
        app.post('/login', async (req, res) => {
            const user = req.body
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })





        //find all services
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray();
            res.send(services)
        })

        //find one service using id
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: objectId(id) }
            const service = await serviceCollection.findOne(query)
            res.send(service)
        })

        //add new service 
        app.post('/services', async (req, res) => {
            const newService = req.body
            const result = await serviceCollection.insertOne(newService)
            res.send(result)
        })

        //delete one service
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: objectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result)
        })

        //order collection api
        app.post('/order', async (req, res) => {
            const order = req.body
            const result = await orderCollection.insertOne(order)
            res.send(result)
        })

        //order display with verify JWT
        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email

            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = orderCollection.find(query)
                const orders = await cursor.toArray();
                res.send(orders)
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }


        })

    } finally {
        //await client.close
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Motor service server')
})



app.listen(port, () => {
    console.log(`server running port ${port}`)
})