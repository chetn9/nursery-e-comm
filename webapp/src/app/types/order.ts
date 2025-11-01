import { CartItem } from "./cartItem"
import { Product } from "./product";

// export interface Order{
//     items: CartItem[],
//       paymentType: string,
//       address: any,
//       date: Date,
//       totalAmount: number,
//       status?:string
// }

export interface OrderItemProduct {
  _id: string;
  name: string;
  price: number;
  discount?: number;
  images?: string[];
  shortDescription?: string;
}

export interface OrderItem {
  _id?: string;
  productId: string; // The ID reference
  product?: OrderItemProduct; // The populated product data (when populated from backend)
  quantity: number;
}


export interface Order {
  _id?: string;
  userId?: string;
  // items: {
  //   product: Product;
  //   quantity: number;
  // }[];
  items: OrderItem[],
  paymentType: string;
  address: any;
  date: Date;
  totalAmount: number;
  status?: string;
  createdAt?: string;      
  updatedAt?: string;
}
