import axios from 'axios';
import { env, isConfigured } from '../config/env.js';
import { Comment } from '../models/Comment.js';
import { CommentReplyLog } from '../models/CommentReplyLog.js';
import { ApiError } from '../utils/apiError.js';

const categoryRules = [
  ['sales_question', ['price', 'cost', 'how much', '$', 'menu']],
  ['location_or_hours', ['where', 'location', 'address', 'open', 'hours', 'when']],
  ['catering_lead', ['cater', 'party', 'event', 'wedding', 'office']],
  ['positive_engagement', ['love', 'great', 'amazing', 'best', 'fire', 'delicious']],
  ['service_issue', ['bad', 'cold', 'wrong', 'wait', 'problem', 'disappointed']]
];

const replyTemplates = {
  sales_question:
    'Thanks for asking! Send us a message with what you are craving and we will help with pricing, menu options, and the best way to order.',
  location_or_hours:
    'Thanks for checking in! We post today’s location and hours here. Message us anytime and we will point you to the next stop.',
  catering_lead:
    'We would love to help with your event. Please message us with the date, guest count, and location so we can talk BBQ catering options.',
  positive_engagement:
    'Thank you for the love! We appreciate you supporting Savannah BBQ and hope to serve you again soon.',
  service_issue:
    'We are sorry to hear this. Please message us with the details so our team can look into it and make it right.',
  general_engagement:
    'Thanks for reaching out! We appreciate you following Savannah BBQ. Message us if we can help with an order or catering question.'
};

export function classifyCommentText(text = '') {
  const normalized = text.toLowerCase();
  const match = categoryRules.find(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)));
  return match?.[0] || 'general_engagement';
}

export function draftReply(classification) {
  return replyTemplates[classification] || replyTemplates.general_engagement;
}

export async function classifyComment(comment) {
  comment.classification = classifyCommentText(comment.commentText);
  comment.status = 'classified';
  await comment.save();
  return comment;
}

export async function draftCommentReply(comment) {
  if (!comment.classification) await classifyComment(comment);
  comment.suggestedReply = draftReply(comment.classification);
  comment.status = 'reply_drafted';
  await comment.save();
  return comment;
}

export async function approveCommentReply(comment, replyText) {
  comment.suggestedReply = replyText || comment.suggestedReply;
  comment.status = 'approved';
  await comment.save();
  return comment;
}

export async function simulateCommentReply(comment, userId) {
  if (comment.status !== 'approved') {
    throw new ApiError(409, 'Comment reply must be approved before simulation');
  }

  comment.status = 'simulated_replied';
  comment.replyStatus = 'simulated_replied';
  comment.lastReplyAttemptAt = new Date();
  await comment.save();

  await CommentReplyLog.create({
    comment: comment.id,
    status: 'simulated_replied',
    replyText: comment.suggestedReply,
    message: 'Reply simulated. Live Facebook comment replies are intentionally disabled.',
    createdBy: userId
  });

  return comment;
}

export function isFacebookReadConfigured() {
  return isConfigured(env.FACEBOOK_PAGE_ID) && isConfigured(env.FACEBOOK_PAGE_ACCESS_TOKEN);
}

export async function fetchFacebookComments(userId) {
  if (!isFacebookReadConfigured()) {
    throw new ApiError(400, 'Facebook read-only credentials are not configured');
  }

  const url = `https://graph.facebook.com/${env.FACEBOOK_GRAPH_VERSION}/${env.FACEBOOK_PAGE_ID}/posts`;
  const response = await axios.get(url, {
    params: {
      access_token: env.FACEBOOK_PAGE_ACCESS_TOKEN,
      fields: 'id,message,created_time,comments.limit(25){id,message,from,created_time}'
    }
  });

  const posts = response.data?.data || [];
  const imported = [];
  for (const post of posts) {
    const comments = post.comments?.data || [];
    for (const item of comments) {
      const doc = await Comment.findOneAndUpdate(
        { facebookCommentId: item.id },
        {
          $setOnInsert: {
            facebookPostId: post.id,
            facebookCommentId: item.id,
            sourcePost: post.message || post.id,
            commenterName: item.from?.name || 'Facebook User',
            commentText: item.message,
            status: 'new',
            createdBy: userId
          }
        },
        { upsert: true, new: true }
      );
      imported.push(doc);
    }
  }
  return imported;
}

export async function seedDemoComments(userId) {
  const samples = [
    ['Weekend Reel', 'How much is a full rack this weekend?'],
    ['Catering Post', 'Do you cater office lunches for 40 people?'],
    ['Food Truck Update', 'Best BBQ in Savannah. The brisket was fire!'],
    ['Lunch Special', 'Where are you parked today and what time do you open?'],
    ['Order Issue', 'My order was cold after waiting a long time.']
  ];

  return Comment.insertMany(
    samples.map(([sourcePost, commentText]) => ({
      sourcePost,
      commentText,
      commenterName: 'Demo Guest',
      status: 'new',
      createdBy: userId
    }))
  );
}
