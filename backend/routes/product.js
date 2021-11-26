const express = require('express')
const router = express.Router()
const productController = require('../controllers/ProductController')
const { isAuthenticated, authorizeRoles } = require('../middleware/Auth')
// const authenticated = require('../middleware/authenticated')
// const auth = require('../middleware/authenticated')
router.post('/product/new',  isAuthenticated,authorizeRoles('admin'),productController.newproduct)

router.get('/admin/products', isAuthenticated,authorizeRoles('admin'), productController.Getproduct)

router.get('/admin/search/:name', isAuthenticated,authorizeRoles('admin'), productController.search)

router.put('/admin/update/:id', isAuthenticated,authorizeRoles('admin'), productController.updateProducts)

router.delete('/admin/delete/:id', isAuthenticated, productController.deleteProducts)

module.exports = router
