const express = require('express');
const router = express.Router();
const Product = require('../model/product');
const mongoose = require('mongoose');

router.get('/',(req,res,next)=>{
    // res.status(200).json({
    //     message: 'Handling GET requests to /products'
    // });
    Product.find().exec()
    .then(docs=>{
        console.log(docs);
        res.status(200).json(docs);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
});

router.post('/',(req,res,next)=>{
    
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    })
    product.save().then(result=>{
        console.log(result);
        res.status(201).json({
            message :"Handling POST requests to /products",
            createdProduct :result
        });
    }).catch(err=>{console.log(err)
        res.status(500).json({
            error: err

        });
    });
    res.status(200).json({
        message: 'Handling POST requests to /products',
        createdProduct :product
    });
});

router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id).exec().then(doc=>{
        console.log("From database",doc);
        if(doc){
            res.status(200).json(doc);
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
router.patch('/:productId',(req,res,next)=>{
    // res.status(200).json({
    //     message: 'Updated product!'
    // });
    const id = req.params.productId;
    const updateOps ={};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({_id:id} ,
        {$set: updateOps}).exec().then(result=>{
            console.log(result);
            res.status(200).json(result);
        }
        ).catch(err=>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:productId',(req,res,next)=>{
    // res.status(200).json({
    //     message: 'Deleted product!'
    // });
    const id = req.params.productId; 
    Product.deleteOne({ _id :id})
    .exec()
    .then(result=>{
        res.status(200).json(result);
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