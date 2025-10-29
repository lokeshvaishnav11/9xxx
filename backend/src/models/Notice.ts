import mongoose, { Document, Schema } from "mongoose";

// Define the TypeScript interface for an Operation
export interface INotice extends Document {

  fnotice: string;
  bnotice: string;

}

// Define the Mongoose schema
const NoticeSchema: Schema = new Schema(
  {
    fnotice:{
        type:String,
        default:""
    },
    bnotice:{
        type:String,
        default:""
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Export the model
export default mongoose.model<INotice>("Notice", NoticeSchema);
