import multer from 'multer';
import { z } from 'zod';
import { Generation } from '../models/Generation.js';
import { generationTasks } from '../services/promptService.js';
import { generateImageCaption, generateText, generateVideoCaption } from '../services/openaiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const upload = multer({ storage: multer.memoryStorage() });

export const generateSchema = z.object({
  body: z.object({
    task: z.enum(generationTasks),
    platform: z.string().default('Facebook'),
    tone: z.string().default('Friendly'),
    input: z.record(z.string(), z.any()).default({}),
    save: z.boolean().default(true)
  })
});

export const generateContent = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body.input,
    platform: req.body.platform,
    tone: req.body.tone
  };
  const result = await generateText(req.body.task, payload);

  let generation = null;
  if (req.body.save) {
    generation = await Generation.create({
      task: req.body.task,
      platform: req.body.platform,
      tone: req.body.tone,
      input: payload,
      output: result.output,
      costEstimate: result.costEstimate,
      createdBy: req.user.id
    });
  }

  res.json({ ...result, generation });
});

export const captionImage = asyncHandler(async (req, res) => {
  const result = await generateImageCaption(req.file, req.body);
  const generation = await Generation.create({
    task: 'image_upload_caption',
    platform: req.body.platform || 'Instagram',
    tone: req.body.tone || 'Friendly',
    input: { mediaName: req.file.originalname, ...req.body },
    output: result.output,
    costEstimate: result.costEstimate,
    createdBy: req.user.id
  });
  res.json({ ...result, generation });
});

export const captionVideo = asyncHandler(async (req, res) => {
  const result = await generateVideoCaption(req.file, req.body);
  const generation = await Generation.create({
    task: 'video_upload_caption',
    platform: req.body.platform || 'TikTok',
    tone: req.body.tone || 'Friendly',
    input: { mediaName: req.file.originalname, ...req.body },
    output: result.output,
    costEstimate: result.costEstimate,
    createdBy: req.user.id
  });
  res.json({ ...result, generation });
});
