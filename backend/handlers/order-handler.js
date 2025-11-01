const Order = require("./../db/order")

async function addOrder(userId, orderModel){
    let order = new Order({
        ...orderModel,
        userId:userId,
        date: new Date,
        status: "inprogress"
    })
    await order.save();
}

// async function getCustomerOrders(userId){
//     let orders = await Order.find({ userId: userId });
//     return orders.map((x) => x.toObject());
// }

async function getCustomerOrders(userId) {
  const orders = await Order.find({ userId })
      .populate({
        path: 'items.productId',  // ✅ Populate the productId field
        select: 'name price discount images shortDescription' // ✅ Select fields to include
      })
      .sort({ createdAt: -1 });
return orders.map(order => ({
    ...order.toObject(),
    items: order.items.map(item => ({
      product: item.productId, // rename populated productId → product
      quantity: item.quantity
    }))
  }));

}

async function getOrders() {
  let orders = await Order.find()
  .populate('userId')
  .populate({
    path: 'items.productId',
    select: 'image name',  
  });
    return orders.map((x) => x.toObject())
}

async function updateOrder(id, update) {
  return await Order.findByIdAndUpdate(id, update, { new: true });
}

async function deleteOrder(id) {
  return await Order.findByIdAndDelete(id);
}


module.exports = { addOrder, getCustomerOrders, getOrders, updateOrder,deleteOrder}