import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsString, IsEmail, MinLength } from 'class-validator';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @IsString()
  @MinLength(2)
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @IsEmail()
  @Prop({
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
  })
  email: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
