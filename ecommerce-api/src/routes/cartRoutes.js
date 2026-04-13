import express from 'express';
import {
  addProductToCart,
  createCart,
  deleteCart,
  getCartById,
  getCartByUser,
  getCarts,
  updateCart,
} from '../controllers/cartController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdmin from '../middlewares/isAdminMiddleware.js';

const router = express.Router();
router.get('/cart', authMiddleware, isAdmin, getCarts);
router.get('/cart/user/:id', authMiddleware, getCartByUser);
router.post('/cart/add-product', authMiddleware, addProductToCart);
router.get('/cart/:id', authMiddleware, isAdmin, getCartById);
router.post('/cart', authMiddleware, createCart);
router.put('/cart/:id', authMiddleware, updateCart);
router.delete('/cart/:id', authMiddleware, deleteCart);

export default router;