import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: String, required: true, trim: true, maxlength: 120 })
  name: string;
  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({ type: Number, required: true, min: 0 })
  stock: number;

  @Prop({ type: String, trim: true, lowercase: true })
  category: string;
}
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ category: 1 });
