import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import OpenAI from 'openai';
import sharp from 'sharp';
import { env, isConfigured } from '../config/env.js';
import { buildPrompt, demoGeneration, estimateTokens } from './promptService.js';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const client = isConfigured(env.OPENAI_API_KEY)
  ? new OpenAI({ apiKey: env.OPENAI_API_KEY })
  : null;

export async function generateText(task, input = {}) {
  const prompt = buildPrompt(task, input);

  if (!client) {
    const output = demoGeneration(task, input);
    return {
      output,
      costEstimate: {
        promptTokens: estimateTokens(prompt),
        completionTokens: estimateTokens(output),
        totalTokens: estimateTokens(prompt) + estimateTokens(output),
        estimatedUsd: 0
      }
    };
  }

  const response = await client.chat.completions.create({
    model: env.OPENAI_TEXT_MODEL,
    temperature: 0.8,
    max_tokens: 700,
    messages: [
      {
        role: 'system',
        content:
          'You are a senior restaurant growth marketer for a Savannah BBQ food truck. Keep output practical, brand-safe, and ready for human review.'
      },
      { role: 'user', content: prompt }
    ]
  });

  const output = response.choices[0]?.message?.content?.trim() || '';
  const usage = response.usage || {};
  const totalTokens =
    usage.total_tokens || (usage.prompt_tokens || estimateTokens(prompt)) + estimateTokens(output);

  return {
    output,
    costEstimate: {
      promptTokens: usage.prompt_tokens || estimateTokens(prompt),
      completionTokens: usage.completion_tokens || estimateTokens(output),
      totalTokens,
      estimatedUsd: Number(((totalTokens / 1000) * 0.002).toFixed(4))
    }
  };
}

export async function generateImageCaption(file, input = {}) {
  const prompt = buildPrompt(input.task || 'facebook_reel_captions', {
    ...input,
    mediaName: file.originalname
  });

  const processed = await sharp(file.buffer)
    .resize({ width: env.MAX_IMAGE_SIDE, height: env.MAX_IMAGE_SIDE, fit: 'inside' })
    .jpeg({ quality: env.IMAGE_JPEG_QUALITY })
    .toBuffer();

  if (!client) {
    return {
      output: demoGeneration('image_caption', { ...input, mediaName: file.originalname }),
      costEstimate: { promptTokens: estimateTokens(prompt), completionTokens: 80, totalTokens: 160, estimatedUsd: 0 }
    };
  }

  const response = await client.chat.completions.create({
    model: env.OPENAI_VISION_MODEL,
    max_tokens: 650,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: `${prompt}\nDescribe the image and produce captions/hooks.` },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${processed.toString('base64')}` }
          }
        ]
      }
    ]
  });

  const output = response.choices[0]?.message?.content?.trim() || '';
  return { output, costEstimate: { totalTokens: response.usage?.total_tokens || estimateTokens(output) } };
}

async function extractVideoFrames(file) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'savannah-video-'));
  const inputPath = path.join(tmpDir, file.originalname.replaceAll('/', '_'));
  await fs.writeFile(inputPath, file.buffer);

  await new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .duration(env.MAX_VIDEO_SECONDS)
      .outputOptions(['-vf', `fps=1/${Math.max(1, Math.floor(env.MAX_VIDEO_SECONDS / env.VIDEO_FRAME_COUNT))}`])
      .output(path.join(tmpDir, 'frame-%03d.jpg'))
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

  const files = (await fs.readdir(tmpDir)).filter((name) => name.endsWith('.jpg')).slice(0, env.VIDEO_FRAME_COUNT);
  const frames = await Promise.all(files.map((name) => fs.readFile(path.join(tmpDir, name))));
  await fs.rm(tmpDir, { recursive: true, force: true });
  return frames;
}

export async function generateVideoCaption(file, input = {}) {
  if (file.size > env.MAX_VIDEO_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`Video exceeds ${env.MAX_VIDEO_UPLOAD_MB}MB limit`);
  }

  const prompt = buildPrompt(input.task || 'viral_hooks', { ...input, mediaName: file.originalname });

  if (!client) {
    return {
      output: demoGeneration('video_caption', { ...input, mediaName: file.originalname }),
      costEstimate: { promptTokens: estimateTokens(prompt), completionTokens: 100, totalTokens: 220, estimatedUsd: 0 }
    };
  }

  const frames = await extractVideoFrames(file);
  const content = [
    { type: 'text', text: `${prompt}\nReview these sampled frames and create video hooks/captions.` },
    ...frames.map((frame) => ({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${frame.toString('base64')}` }
    }))
  ];

  const response = await client.chat.completions.create({
    model: env.OPENAI_VISION_MODEL,
    max_tokens: 650,
    messages: [{ role: 'user', content }]
  });

  const output = response.choices[0]?.message?.content?.trim() || '';
  return { output, costEstimate: { totalTokens: response.usage?.total_tokens || estimateTokens(output) } };
}
