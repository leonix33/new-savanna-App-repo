import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema(
  {
    task: { type: String, required: true, index: true },
    platform: { type: String, required: true, index: true },
    tone: { type: String, required: true },
    input: { type: mongoose.Schema.Types.Mixed, required: true },
    output: { type: String, required: true },
    costEstimate: {
      promptTokens: Number,
      completionTokens: Number,
      totalTokens: Number,
      estimatedUsd: Number
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

generationSchema.index({ task: 'text', platform: 'text', tone: 'text', output: 'text' });

export const Generation = mongoose.model('Generation', generationSchema);
