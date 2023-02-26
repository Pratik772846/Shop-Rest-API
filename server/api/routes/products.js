const express = require('express');
const router = express.Router();
const Product = require('../model/product');
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename: function(req,file,cb){
        cb(null, new Date().toISOString()+file.originalname);
    }
});
const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true);
    }else{
        cb(null,false);
    }
}

const upload = multer({
    storage:storage,
    limits:{
    fileSize : 1024*1024*5
    },
    fileFilter:fileFilter
});
// cannot do /uploads/ because it is not a static folder

router.get('/',(req,res,next)=>{
    Product.find()
    .select("name price _id productImage")
    .exec()
    .then(docs=>{
        const response = {
            count: docs.length,
            products: docs.map(doc=>{
                return {
                    name: doc.name,
                    price: doc.price,
                    _id: doc._id,
                    productImage : doc.productImage,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/'+doc._id
                    }
                }
            })
        };

        // console.log(docs);
        res.status(200).json(response);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

router.post('/',checkAuth,upload.single('productImage'),(req,res,next)=>{
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage:req.file.path
    })
    product.save().then(result=>{
        console.log(result);
        res.status(201).json({
            message :"Product added successfully",
            createdProduct :{
                price:result.price,
                name: result.name,
                _id : result._id,
                productImage: result.productImage,
                request:{
                    type: "GET",
                    url: 'http://localhost:3000/products/'+result._id
                }
            }
        });
    }).catch(err=>{console.log(err)
        res.status(500).json({
            error: err

        });
    });
    // res.status(200).json({
    //     message: 'Handling POST requests to /products',
    //     createdProduct :product
    // });
});

router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id).
    select('name price _id productImage').
    exec().then(doc=>{
        console.log("From database",doc);
        if(doc){
            res.status(200).json({
                message :"product fetched with id "+id,
                name: doc.name,
                price : doc.price,
                _id : doc._id,
                peoductImage: doc.productImage,
                request:{
                    type: "GET",
                    url :"http://localhost:3000/products"+ doc._id
                }

            });
        }else{
            res.status(404).json({message: 'No valid entry found for provided ID'});
        }
    }
    ).catch(err=>{
        console.log(err);
        res.status(500).json({error: err});
    }
    );
});

// body for patch
// [
//     {"propName": "name", "value": "updated name"}
// ]
router.patch('/:productId',checkAuth,(req,res,next)=>{
    const id = req.params.productId;
    const updateOps ={};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({_id:id} ,
        {$set: updateOps}).exec().then(result=>{
            console.log(result);
            res.status(200).json({
                message: 'Product updated',
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/products/'+id
                }
            });
        }
        ).catch(err=>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:productId',checkAuth,(req,res,next)=>{
    // res.status(200).json({
    //     message: 'Deleted product!'
    // });
    const id = req.params.productId; 
    Product.deleteOne({ _id :id})
    .exec()
    .then(result=>{
        res.status(200).json({
            message: 'Product deleted',
            request:{
                type: 'POST',
                url: 'http://localhost:3000/products',
                body: {name: 'String', price: 'Number'}
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
    );

});

module.exports=router;