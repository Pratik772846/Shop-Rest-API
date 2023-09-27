const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const Order = require('../model/order');
const Product = require('../model/product');
const checkAuth = require('../middleware/check-auth');

const OrdersController = require('../controllers/order.js');

router.get('/',checkAuth,OrdersController.order_get_all);
// router.get('/:orderId',checkAuth,OrdersController.orders_get_order);

router.post('/',checkAuth,(req,res,next)=>{
    Product.findById(req.body.productId)
    .then((product)=>{
        if(!product){
            res.status(500).json({
                message:"product not found"
            })
        }
        const order=new Order({
            _id: mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product: req.body.productId
        
        })
        return order
        .save()
    })
        .then((result)=>{
            console.log(result);
            res.status(201).json({
                message: 'Order stored',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/'+result._id
                }
    
            });
        })
        .catch((err)=>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
    


router.get("/:orderId",checkAuth,(req,res,next)=>{
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then((order)=>{
        if(!order){
            res.status(500).json({
                message:"Order not found"
            })
        }
        res.status(200).json({
            order: order,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/orders'
            }
        });
    })
    .catch((err)=>{
        res.status(500).json({
            error:err
        })
    })
});

router.delete("/:orderId",checkAuth,(req,res,next)=>{
    Order.deleteOne({_id:req.params.orderId})
    .exec()
    .then((result)=>{
        res.status(200).json({
            message:"Order deleted",
            request: {
                type: 'POST',
                url: 'http://localhost:3000/orders',
                body: {productId: "ID", quantity: "Number"}
            }
        });
    })
    .catch((err)=>{
        res.status(500).json({
            error:err
        })
    })
});


module.exports = router;