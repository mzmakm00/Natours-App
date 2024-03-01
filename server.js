const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path : './config.env' })      // storing all the variables from .env file into node

const app = require('./app')

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose
.connect(process.env.DATABASE_LOCAL,{
//    useNewUrlParser:true,
//    useUnifiedTopology:true
})
.then(con => {
    console.log("DB connection sucessfully !")
}).catch(error => console.log(error))

app.get('/',(req,res) => {
    res.send("<h1>hello from node js</h1>")
})


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on ${port}`)
})
