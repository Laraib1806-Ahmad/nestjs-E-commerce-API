import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Order, OrderDocument } from './orders.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { CustomersService } from '../customers/customers.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private customersService: CustomersService,
    private productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    const { customer, items } = createOrderDto;

    let existingCustomer = await this.customersService.findByEmail(
      customer.email,
    );
    if (!existingCustomer) {
      existingCustomer = await this.customersService.create(
        customer.name,
        customer.email,
      );
    }

    const orderItems = [];
    let total = 0;

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}`,
        );
      }

      const priceAtPurchase = product.price;
      total += priceAtPurchase * item.quantity;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtPurchase,
      });

      await this.productsService.decrementStock(item.productId, item.quantity);
    }

    const order = new this.orderModel({
      customer: existingCustomer._id,
      items: orderItems,
      total,
    });

    return order.save();
  }

  async findOne(id: string): Promise<OrderDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Order not found');
    }
    const order = await this.orderModel
      .findById(id)
      .populate('items.product', 'name category')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByCustomerEmail(email: string): Promise<OrderDocument[]> {
    const customer = await this.customersService.findByEmail(email);
    if (!customer) {
      return [];
    }
    return this.orderModel
      .find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .exec();
  }
}
