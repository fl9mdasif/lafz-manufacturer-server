const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');

// app.use(cors({ origin: "https://famous-footwear-warehouse.web.app" }))
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@job-preparation.81qj5al.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1]

    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next()
    });
}


async function run() {
    try {
        await client.connect();
        console.log('database connected');

        const ProductsCollection = client.db('lafz-cosmetic-database').collection('products');
        const userOrderCollection = client.db('lafz-cosmetic-database').collection('userOrders');
        const userReviewCollection = client.db('lafz-cosmetic-database').collection('userReviews');
        const userDetailCollection = client.db('lafz-cosmetic-database').collection('userCollection');
        const userEmailCollection = client.db('lafz-cosmetic-database').collection('userEmail');




        // get all products 
        app.get('/allProducts', async (req, res) => {
            const query = {};
            const cursor = ProductsCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        // get single product for product details 
        app.get('/allProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singleProduct = await ProductsCollection.findOne(query);
            res.send(singleProduct);
        });

        //add product  
        app.post('/addProduct', async (req, res) => {
            const newShoe = req.body;
            const result = await ProductsCollection.insertOne(newShoe);
            res.send(result);
        });

        // delete  a product from manage product
        app.delete('/allProducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ProductsCollection.deleteOne(query);
            res.send(result);
        });


        // restock Quantity by  getting user order
        app.put("/allProducts/:id", async (req, res) => {
            const data = req.body;
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    name: data.name,
                    description: data.description,
                    minOrder: data.minOrder,
                    price: data.price,
                    available: data.available,
                    imgUrl: data.imgUrl,
                },
            };
            // console.log(updateDoc);
            const options = { upsert: true };
            const result = await ProductsCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });


        //user starts
        //add user orders 
        app.post('/userOrder', async (req, res) => {
            const userOrder = req.body;
            const result = await userOrderCollection.insertOne(userOrder);
            res.send(result);
        });

        //get user orders
        app.get('/userOrder', verifyJWT, async (req, res) => {
            const order = req.query.order;
            const query = { order: order };
            const orders = await userOrderCollection.find(query).toArray();
            res.send(orders);
        });

        //delete users order
        app.delete('/userOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userOrderCollection.deleteOne(query);
            res.send(result);
        });

        // post user reviews  
        app.post('/userReview', async (req, res) => {
            const userOrder = req.body;
            const result = await userReviewCollection.insertOne(userOrder);
            res.send(result);
        });

        //  get user reviews  
        app.get('/userReview', async (req, res) => {
            const query = {};
            const cursor = userReviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });


        //  post user details 
        app.post('/userCollection', async (req, res) => {
            const userOrder = req.body;
            const result = await userDetailCollection.insertOne(userOrder);
            res.send(result);
        });

        // get user details
        app.get('/userCollection', async (req, res) => {
            const query = {};
            const cursor = userDetailCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //user end

        // get user by email  
        // app.get('/userCollection/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const filter = { email: email };
        //     const result = await userCollection.findOne(filter);
        //     res.send(result);
        // });

        // user mail data put api
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const updateDoc = {
                $set: user,
            };
            const options = { upsert: true };
            const result = await userEmailCollection.updateOne(filter, updateDoc, options);
            var token = jwt.sign({ email: email }, process.env.SECRET_ACCESS_TOKEN, { expiresIn: '1h' });
            res.send({ result, token });
        })

        // make a user to role admin 
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userEmailCollection.findOne({ email: requester })
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userEmailCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                res.status(403).send({ message: "forbidden" })
            }

        })


        // get all user added items  
        app.get('/users', verifyJWT, async (req, res) => {
            const query = {};
            const cursor = userEmailCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        });

        // delete a user  
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userEmailCollection.deleteOne(query);
            res.send(result);
        });


        // //blog
        // app.get('/blogs', async (req, res) => {
        //     const query = {};
        //     const cursor = blogCollection.find(query);
        //     const blog = await cursor.toArray();
        //     res.send(blog);

        // });
        // // get single blog details 
        // app.get('/blogs/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const singleProduct = await blogCollection.findOne(query);
        //     res.send(singleProduct);
        // });

        // // update blog viewers
        // app.put("/blogs/:id", async (req, res) => {
        //     const data = req.body;
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const updateDoc = {
        //         $set:
        //         {
        //             reaction: data.reaction,
        //             category: data.category,
        //             blog_title: data.blog_title,
        //             blog_description: data.blog_description,
        //             viewers: data.viewers
        //         }
        //     }
        //     // console.log(updateDoc)
        //     const options = { upsert: true };
        //     const result = await blogCollection.updateOne(filter, updateDoc, options);
        //     res.send(result);
        // });




    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello lafz-cosmetic-database')
})

app.listen(port, () => {
    console.log(`listening to lafz-cosmetic ${port}`)
})