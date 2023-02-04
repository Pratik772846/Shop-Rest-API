const express= require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');

mongoose.set("strictQuery", false);
// mongoose.set("useMongoClient", true);
// mongoose.connect('mongodb+srv://Pratik:'+ process.env.MONGO_ATLAS_PW + '@cluster0.3leactl.mongodb.net/?retryWrites=true&w=majority' )
// .then(()=>console.log('connected'))
// .catch(e=>console.log(e));

mongoose.connect('mongodb+srv://Pratik:'+ process.env.MONGO_ATLAS_PW + '@cluster0.3leactl.mongodb.net/?retryWrites=true&w=majority' 
)
mongoose.Promise = global.Promise;
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','*');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/orders', orderRoutes);
app.use('/products', productRoutes);

app.use((req,res,next)=>{
    const error = new Error('Not found');
    error.status=404;
    next(error);
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
})

module.exports = app;