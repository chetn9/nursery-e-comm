const express = require ("express");
const { getNewProducts, getFeaturedProducts, getProductForListing, getProduct } = require("../handlers/product-handler");
const { getCategories } = require("../handlers/category-handler");
const { getBrands } = require("../handlers/brand-handler");
const { getWishList, addToWishlist, removeFromWishlist } = require("../handlers/wishlist-handler");
const { getCartItems, addToCart, removeFromCart, clearCart } = require("../handlers/shopping-cart-handler");
const { applyDefaults } = require("./../db/product");
const { addOrder, getCustomerOrders } = require("../handlers/order-handler");
const Order = require("../db/order");
const router = express.Router();

router.get("/new-products",async (req,res)=>{
    const products = await getNewProducts();
    res.send(products);
})


router.get("/featured-products",async (req,res)=>{
    const products = await getFeaturedProducts();
    res.send(products);
})

router.get("/categories",async (req,res)=>{
    const categories = await getCategories();
    res.send(categories);
})

router.get("/brands",async (req,res)=>{
    const brands = await getBrands();
    res.send(brands);
})

router.get("/products",async (req,res)=>{
    const { searchTerm, categoryId, sortBy, sortOrder, brandId, pageSize, page } = req.query
    const products = await getProductForListing(
        searchTerm, 
        categoryId, 
        page,
        pageSize,
        sortBy, 
        sortOrder,
        brandId,
    );
    res.send(products);
});

router.get("/product/:id", async (req,res)=>{

    const id = req.params["id"];
    const product = await getProduct(id)
    res.send(product);
})

router.get("/wishlists" , async (req,res)=>{
    //console.log(req.user);
    const userId = req.user.id;
    const items = await getWishList(userId)
    res.send(items)
})

router.post("/wishlists/:id" , async (req,res)=>{
    //console.log(req.user);
    const userId = req.user.id;
    const productId =req.params.id
    const item = await addToWishlist(userId,productId)
    res.send(item)
})

router.delete("/wishlists/:id" , async (req,res)=>{
    //console.log(req.user);
    const userId = req.user.id;
    const productId =req.params.id
    const item = await removeFromWishlist(userId,productId)
    res.send({message:"ok"})
})

router.get("/carts" , async (req, res) => {
    // console.log("Crt",req.user);
    const userId = req.user.id;
    const items = await getCartItems(userId)
    res.send(items)
})

router.post("/carts/:id" , async (req,res)=>{
    // console.log(req.user);
    const userId = req.user.id;
    const productId = req.params.id;
    const quantity = req.body.quantity;
    const items = await addToCart(userId,productId,quantity)
    res.send(items)
})

router.delete("/carts/:id" , async (req,res)=>{
    // console.log(req.user);
    const userId = req.user.id;
    const productId = req.params.id;
    const items = await removeFromCart(userId,productId)
    res.send(items)
})

router.post("/order",async (req, res)=>{
    console.log("Order Api hit==>", req.body);
    const userId = req.user.id;
    const order = req.body;
    
    await addOrder(userId, order);
    await clearCart(userId);
    return res.send({
        message: "Order Creadted",
    })
})

// Backend - routes/orders.js
// router.post('/order', async (req, res) => {
//   try {
//     const { items, paymentType, address, totalAmount, date } = req.body;
//     const userId = req.user.id; // From JWT token

//     console.log('📦 Received order request');
//     console.log('User ID:', userId);
//     console.log('Items:', items);
//     console.log('Payment Type:', paymentType);
//     console.log('Address:', address);
//     console.log('Total Amount:', totalAmount);

//     // Validation
//     if (!items || items.length === 0) {
//       return res.status(400).json({ message: 'Cart items are required' });
//     }

//     if (!address) {
//       return res.status(400).json({ message: 'Address is required' });
//     }

//     // Validate each item - LOG DETAILS
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       console.log(`Validating item ${i}:`, item);
//       console.log(`  - productId: ${item.product?._id} (type: ${typeof item.product?._id})`);
//       console.log(`  - quantity: ${item.quantity} (type: ${typeof item.quantity})`);

//       if (!item.product?._id) {
//         console.error(`❌ Item ${i} missing productId:`, item);
//         return res.status(400).json({ 
//           message: 'Each item must have productId and quantity',
//           invalidItem: item,
//           itemIndex: i,
//           reason: 'Missing productId'
//         });
//       }

//       if (!item.quantity || item.quantity < 1) {
//         console.error(`❌ Item ${i} invalid quantity:`, item);
//         return res.status(400).json({ 
//           message: 'Each item must have productId and quantity',
//           invalidItem: item,
//           itemIndex: i,
//           reason: 'Invalid quantity'
//         });
//       }
//     }

//     console.log('✅ All items validated successfully');

//     // Create new order
//     const order = new Order({
//       userId,
//       items,
//       paymentType: paymentType || 'COD',
//       address,
//       date: date || new Date(),
//       totalAmount,
//       status: 'Pending'
//     });

//     await order.save();
//     console.log('✅ Order saved successfully:', order._id);

//     // Optional: Clear user's cart after successful order
//     await Cart.deleteMany({ userId });
//     console.log('✅ Cart cleared for user:', userId);

//     res.status(201).json(order);
//   } catch (error) {
//     console.error('❌ Error creating order:', error);
//     res.status(500).json({ 
//       message: 'Failed to create order', 
//       error: error.message 
//     });
//   }
// });


router.get("/orders", async (req, res) => {
  const userId = req.user.id;
  const orders = await getCustomerOrders(userId);
  console.log(orders);
  return res.send(orders);
});

module.exports = router;