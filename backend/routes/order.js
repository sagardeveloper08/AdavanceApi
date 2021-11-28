const express = require('express')
const router = express.Router();
const orderController = require("../controllers/orderController");
const { isAuthenticated, authorizeRoles } = require("../middleware/Auth");


router.post('/order/new', isAuthenticated, orderController.newOrder)

router.get('/order/:id', isAuthenticated, orderController.getSingleOrder)

router.get('/orders/me', isAuthenticated, orderController.myOrder)

router.get('/admin/allorder', isAuthenticated,authorizeRoles('admin'), orderController.allOrders)

router.put('/admin/order/update/:id',isAuthenticated,authorizeRoles('admin'),orderController.updateOrderStatus)

router.delete('/admin/order/delete/:id',isAuthenticated,authorizeRoles('admin'),orderController.deleteOrder)

module.exports = router