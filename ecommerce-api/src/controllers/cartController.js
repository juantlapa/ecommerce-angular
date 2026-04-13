import Cart from '../models/cart.js';

async function getCarts(req, res, next) {
  try {
    const carts = await Cart.find().populate('user').populate('products.product');
    res.json(carts);
  } catch (error) {
    next(error);
  }
}

async function getCartById(req, res, next) {
  try {
    const id = req.params.id;
    const cart = await Cart.findById(id).populate('user').populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function getCartByUser(req, res, next) {
  try {
    const userId = req.params.id;
    console.log('📡 Buscando carrito para usuario:', userId);

    const cart = await Cart.findOne({ user: userId }).populate('user').populate('products.product');

    if (!cart) {
      console.log('⚠️ No se encontró carrito, retornando carrito vacío');
      return res.status(200).json({
        message: 'No cart found for this user',
        cart: null,
      });
    }

    console.log('✅ Carrito encontrado:', cart._id);
    res.json({ message: 'Cart retrieved successfully', cart });
  } catch (error) {
    console.error('❌ Error en getCartByUser:', error);
    next(error);
  }
}

async function createCart(req, res, next) {
  try {
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          error: 'Each product must have product ID and quantity >= 1',
        });
      }
    }

    const newCart = await Cart.create({ user, products });
    await newCart.populate('user');
    await newCart.populate('products.product');

    res.status(201).json(newCart);
  } catch (error) {
    next(error);
  }
}

async function updateCart(req, res, next) {
  try {
    const { id } = req.params;
    const { user, products } = req.body;

    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({
          error: 'Each product must have product ID and quantity >= 1',
        });
      }
    }

    const updatedCart = await Cart.findByIdAndUpdate(id, { user, products }, { new: true })
      .populate('user')
      .populate('products.product');

    if (updatedCart) {
      return res.status(200).json(updatedCart);
    } else {
      return res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    next(error);
  }
}

async function deleteCart(req, res, next) {
  try {
    const { id } = req.params;
    const deletedCart = await Cart.findByIdAndDelete(id);

    if (deletedCart) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: 'Cart not found' });
    }
  } catch (error) {
    next(error);
  }
}

async function addProductToCart(req, res, next) {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'userId is required',
        received: { userId, productId, quantity },
      });
    }

    if (!productId) {
      return res.status(400).json({
        message: 'productId is required',
        received: { userId, productId, quantity },
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message: 'Valid quantity (>= 1) is required',
        received: { userId, productId, quantity },
      });
    }

    console.log('✅ Validación pasada, buscando carrito...');

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }],
      });
    } else {
      // Verificar si el producto ya está en el carrito
      const existingProductIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (existingProductIndex >= 0) {
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
    }

    await cart.save();
    await cart.populate('user');
    await cart.populate('products.product');

    res.status(200).json({
      message: 'Product added to cart successfully',
      cart,
    });
  } catch (error) {
    next(error);
  }
}

export {
  addProductToCart,
  createCart,
  deleteCart,
  getCartById,
  getCartByUser,
  getCarts,
  updateCart,
};
