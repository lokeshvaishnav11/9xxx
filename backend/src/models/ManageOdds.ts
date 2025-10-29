import mongoose, { Document, Schema } from "mongoose";

// Define the TypeScript interface for an Operation
export interface IModds extends Document {

  Backs: string;
  Lays: string;

}

// Define the Mongoose schema
const ModdSchema: Schema = new Schema(
  {
    Backs:{
        type:Number,
        default:0
    },
    Lays:{
        type:Number,
        default:0
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the model
export default mongoose.model<IModds>("ManageOdds", ModdSchema);
