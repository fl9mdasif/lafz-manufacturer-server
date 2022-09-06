const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// app.use(cors({ origin: "https://famous-footwear-warehouse.web.app" }))
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@job-preparation.81qj5al.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        console.log('database connected');

        const ProductsCollection = client.db('lafz-cosmetic-database').collection('products');
        const userOrderCollection = client.db('lafz-cosmetic-database').collection('userOrders');
        const userReviewCollection = client.db('lafz-cosmetic-database').collection('userReviews');



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


        //user starts
        //add user orders 
        app.post('/userOrder', async (req, res) => {
            const userOrder = req.body;
            const result = await userOrderCollection.insertOne(userOrder);
            res.send(result);
        });

        //get user orders
        app.get('/userOrder', async (req, res) => {
            const query = {};
            const cursor = userOrderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //delete users order
        app.delete('/userOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userOrderCollection.deleteOne(query);
            res.send(result);
        });

        //user end


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


        // post user reviews  
        app.post('/userReview', async (req, res) => {
            const userOrder = req.body;
            const result = await userReviewCollection.insertOne(userOrder);
            res.send(result);
        });

        // get user added items  

        // app.get('/userAddedItems', async (req, res) => {
        //     const query = {};
        //     const cursor = userAddedCollection.find(query);
        //     const shoe = await cursor.toArray();
        //     res.send(shoe);
        // });



        //delete a shoe by user

        // app.delete('/userAddedItems/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await userAddedCollection.deleteOne(query);
        //     res.send(result);
        // });



        // delivery btn decrease quantity by one   

        // app.put("/allShoes/:id", async (req, res) => {
        //     const data = req.body;
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const updateDoc = {
        //         $set: {
        //             name: data.name,
        //             description: data.description,
        //             brand: data.brand,
        //             gender: data.gender,
        //             originalPrice: data.originalPrice,
        //             discountPrice: data.discountPrice,
        //             available: data.available,
        //             imgUrl: data.imgUrl,
        //             discountRoundPrice: data.discountRoundPrice,
        //         },
        //     };
        //     // console.log(updateDoc)
        //     const options = { upsert: true };
        //     const result = await shoesCollection.updateOne(filter, updateDoc, options);
        //     res.send(result);
        // });


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