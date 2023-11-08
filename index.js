const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser =require('cookie-parser')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors({ origin: '*' }));

// const logger = async( req, res, next ) =>{
//   console.log('called:', req.hostname, req.originalUrl);
//   next()
// }

// const verifyToken = async(req, res, next) =>{
//   const token = req.cookies?.token;
//   console.log('value of token in middle ware', token);
//   if(!token){
//     return res.status(401).send({message: 'Not authorized'})
//   }
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
//     // Err
//     if(err){
//       console.log(err);
//       return res.status(401).send({message: 'unauthorized'})
//     }

//     //Valid
//     console.log('value in the decoded:', decoded);
//     req.user = decoded;
//     next()

//   })

// }




// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true, // Allow credentials (cookies) to be sent
// }));

// app.use(cookieParser())
// app.use(express.json());
// app.options('*', cors());

// Enable CORS for all routes
// app.use(
//   cors({
//     origin: 'http://localhost:5173', // Specify the allowed origin(s)
//     methods: ['GET', 'POST'], // Specify the allowed HTTP methods
//   })
// );


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n8c8sym.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)


    const jobsCollection = client.db('BDJobsDB').collection('jobsCollection');

    const appliedJobsCollection = client.db('BDJobsDB').collection('appliedJobs')



    // // for auth
    // app.post('/jwt', logger, async (req, res) => {
    //   const user = req.body;
    //   console.log(user);
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    //   res
    //     .cookie('token', token, {
    //       httpOnly: true,
    //       secure: false,
    //     })
    //     .send({ success: true });
    // });





    // for job application

    // app.get('/applied-jobs', async (req, res) => {
    //   console.log(req.query);
    //   let query = {};
    //   if (req.query?.email) {
    //     query = { applicant_email: req.query.email }; // Use the correct field name 'applicant_email'
    //   }
    //   const cursor = appliedJobsCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });
    
    app.get('/applied-jobs', async (req, res) => {
      // console.log(req.query);
      let query = {};
      if (req.query?.user_id) {
        query = { uid: req.query.user_id }; // Use the correct field name 'applicant_email'
      }
      const cursor = appliedJobsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // app.get('/applied-jobs', async (req, res) => {
    //   console.log(req.query);
    //   // console.log("tok tok token", req.cookies.token);
    //   console.log('user in the valid token', req.user);
    //   // console.log('akam', req.query.uid);
    //   // console.log('akam222', req.user.email);
    //   // if(req.query.uid !== req.user.email){
    //   //   return res.status(403).send({message: 'forbidden access'})
    //   // }

    //   let query = {};
    //   if (req.query?.uid) {
    //     query = { uid: req.query.uid }; // Use the correct field name 'applicant_email'
    //   }
    //   const cursor = appliedJobsCollection.find(query);
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });


    app.post('/applied-jobs', async (req, res) => {
      const appliedJob = req.body;
      // console.log(appliedJob);
      const result = await appliedJobsCollection.insertOne(appliedJob);
      // console.log(result);
      res.send(result);
    })

    // app.get('/cartItems/:id', async (req, res) => {
    //   const id = req.params.id;
    //   console.log(id);
    //   const query = { _id: new ObjectId(id) };
    //   console.log(query);
    //   const result = await appliedJobsCollection.findOne(query);
    //   console.log(result);
    //   res.send(result);
    // });


    // app.delete('/cartItems/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const query = { _id: new ObjectId(id) }
    //   const result = await appliedJobsCollection.deleteOne(query);
    //   res.send(result);
    // })

    // for Jobs

    app.get('/jobs', async (req, res) => {
      const cursor = jobsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobsCollection.findOne(query);
      res.send(result);
    })

    app.get('/my-jobs/:email', async (req, res) => {
      const query = { posted_by_email: req.params.email };
      const results = await jobsCollection.find(query).toArray();
      res.send(results);
    });

    app.post('/jobs', async (req, res) => {
      const newJob = req.body;
      // console.log(newJob);
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    })


    app.delete('/my-jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    })

    app.put('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedJob = req.body;

      const job = {
        $set: {
          banner_image: updatedJob.banner_image,
          company_logo: updatedJob.company_logo,
          company_name: updatedJob.company_name,
          posted_by: updatedJob.posted_by,
          posted_by_email: updatedJob.posted_by_email,
          job_title: updatedJob.job_title,
          job_category: updatedJob.job_category,
          job_type: updatedJob.job_type,
          job_location: updatedJob.job_location,
          salary_range: updatedJob.salary_range,
          job_description: updatedJob.job_description,
          job_posting_date: updatedJob.job_posting_date,
          application_deadline: updatedJob.application_deadline,
          applicants_number: updatedJob.applicants_number
        }
      }
      console.log(job);

      const result = await jobsCollection.updateOne(filter, job, options);

      res.send(result);
    })

    app.put('/job/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const update = { $inc: { applicants_number: 1 } }
      const result = await jobsCollection.updateOne(filter, update);
      console.log(result);
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


app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
})