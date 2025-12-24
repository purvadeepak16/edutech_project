import mongoose, { Schema, Document } from 'mongoose';

export interface IMindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId: string | null;
  color: string;
}

export interface IMindMap extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  nodes: IMindMapNode[];
  createdAt: Date;
  updatedAt: Date;
}

const MindMapNodeSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  parentId: { type: String, default: null },
  color: { type: String, required: true }
}, { _id: false });

const MindMapSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  nodes: [MindMapNodeSchema]
}, {
  timestamps: true
});

export default mongoose.model<IMindMap>('MindMap', MindMapSchema);
