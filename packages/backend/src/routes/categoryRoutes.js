const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

router.get('/categories', categoryController.getAllCategories);
router.post('/categories', auth, categoryController.createCategory);
router.get('/categories/:id', categoryController.getCategory);
router.patch('/categories/:id', auth, categoryController.updateCategory);
router.delete('/categories/:id', auth, categoryController.deleteCategory);

module.exports = router;
