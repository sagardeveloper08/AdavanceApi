const Order = require('../models/order')
const Products = require('../models/products')
const user = require('../models/user')


exports.newOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingInfo,
            totalPrice,
            ShippingPrice,
            taxPrice,
            itemPrices,
            paymentInfo
        } = req.body

        const order = await Order.create({
            orderItems,
            shippingInfo,
            totalPrice,
            ShippingPrice,
            taxPrice,
            itemPrices,
            paymentInfo,
            paidAt: Date.now(),
            user: req.user._id
        })
        if (order) {
            res.status(200).json({ message: "order placed sucessfully", order })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "Something went Wrong" })
    }
}


// getsingleorder for logged in user

exports.getSingleOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email')
        if (!order) {
            res.status(400).json({ message: "order not found" })
        }
        res.status(200).json({ message: "Order found", order })
    } catch (err) {
        res.status(401).json({ message: "something went wrong" })
    }
}


exports.myOrder = async (req, res) => {
    try {
        console.log(req.user.id)
        // const users = await user.find({ user: req.user.id })
        const orders = await Order.find({ user: req.user._id })
        console.log(orders)
        if (!orders) {
            res.status(400).json({ message: "you have no orders" })
        }
        res.status(200).json({ message: "order", orders })
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ message: "something went wrong 1" })
    }

}


exports.allOrders = async (req, res) => {
    try {
        const orders = await Order.find()
        let totalPrice = 0;
        orders.forEach(Order => {
            totalPrice += Order.totalPrice
        })
        if (orders) {
            res.status(200).json({ message: "Order fornd", totalPrice, orders })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "order not found" })
    }
}

// 
exports.updateOrderStatus = async (req, res) => {
    try {
        const orders = await Order.findById(req.params.id)
        console.log(orders)
        if (orders.orderStatus === 'Delivered') {
            res.status(201).json({ message: "you have already delivered the order" })
            
            orders.orderItems.forEach(async item => {
                await updateStock(item.product, item.quantity)
            })

            orders.orderStatus = req.body.status,
                orders.deliveredAt = Date.now()

            await orders.save()

            if (orders) {
                res.status(200).json({ message: "Order found", orders })
            }
        }
        else {
            res.status(402).json({message:"order not found"})
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ message:"err" })
    }
}

async function updateStock(id, quantity) {
    const product = await Products.findById(id)

    product.stock = product.stock - quantity

    await product.save()
}

exports.deleteOrder = async (req, res) => {
    try {
        const orders = await Order.findById(req.params.id)
        if (!orders) {
            res.status(400).json({ message: "No order found" })
        }
        await orders.remove()
        res.status(200).json({ message: "order deleted sucessfully", orders })
    }
    catch (err) {
        console.log(err)
        res.status(400).json({ message: "something went wrong" })
    }
}