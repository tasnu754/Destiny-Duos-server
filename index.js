const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o9ylutr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


      const database = client.db("destinyDuos");
      const biodatas = database.collection("biodatas");
      const users = database.collection("users");
      const favourites = database.collection("favourites");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
      
      
    app.get('/biodatas', async (req, res) => {
        
      let queryobj = {};

      const biodatatype = req.query.biodatatype; //(Male or Female)
      const permanent_division_name = req.query.permanent_division_name; // (Dhaka, Barisal,Rongpur)
      const role = req.query.role; // (Dhaka, Barisal,Rongpur)
       
        if (biodatatype) {
            queryobj.biodatatype = biodatatype;
        }

        if (permanent_division_name) {
            queryobj.permanent_division_name = permanent_division_name;
        }
      if (role) {
          queryobj.role = role
        }

      
          const cursor = biodatas.find(queryobj)
          const result = await cursor.toArray();
          res.send(result);
    })

    app.get('/biodataDetails/:id', async(req, res) => {
        const id = req.params.id
        const query = { biodataId : parseInt(id) };
        const biodata = await biodatas.findOne(query);
      

        if (biodata.biodatatype === "Male") {
      
        const query1 = { biodatatype : "Male" };
        const others = await biodatas.find(query1).toArray();
           res.send({biodata , others });
      }
      else { 
        const query2 = { biodatatype : "Female" };
          const others = await biodatas.find(query2).toArray();
           res.send({biodata ,  others});
      }

     
    })

    app.get('/userBiodata/:email', async (req, res) => {
      const email = req.params.email
      const query = { contact_email: email};
      const result = await biodatas.findOne(query);
      console.log(result);
      res.send(result)
    })
    

    app.get('/biodatas/count', async (req, res) => {
       const totalBiodatasCount = await biodatas.countDocuments({});
       const maleBiodatasCount = await biodatas.countDocuments({ biodatatype: 'Male' });
       const femaleBiodatasCount = await biodatas.countDocuments({ biodatatype: 'Female' });

       res.json({
         totalBiodatasCount,
         maleBiodatasCount,
         femaleBiodatasCount,
       });
    })

    app.get("/user/role/:email", async (req, res) => {
        const email = req.params.email
        const query = { userEmail : email };
      const result = await users.findOne(query); 
        res.send(result)
    })

    app.put("/users", async (req, res) => {
      const userBody = req.body;
      const filter = { userEmail : userBody.email };
      const options = { upsert: true }

       const user = {
         $set: {
           userEmail: userBody.email,
           userName: userBody.displayName,
           userPhoto: userBody.photoURL,
           role: userBody.role
        }
      }

      const result = await users.updateOne(filter , user , options); 
      res.send(result);
    })

    app.post("/favourites", async (req, res) => {
      const biodataItem = req.body;
      const result = await favourites.insertOne(biodataItem);
      res.send(result);

    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send("Destiny Duos is running");
})

app.listen(port, () => {
    console.log(`Destiny Duos is running on port ${port}`);
})