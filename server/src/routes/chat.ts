import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { generateAIResponse } from '../services/ai';

export const chatRouter = Router();

// Get user's chat threads
chatRouter.get('/chat/threads', requireAuth, async (req: AuthRequest, res) => {
  const threads = await prisma.chatThread.findMany({
    where: { userId: req.userId! },
    include: { 
      messages: { 
        orderBy: { createdAt: 'desc' }, 
        take: 1 
      } 
    },
    orderBy: { updatedAt: 'desc' }
  });
  
  const threadsWithLastMessage = threads.map(thread => ({
    ...thread,
    lastMessage: thread.messages[0] || null,
    messages: undefined
  }));
  
  res.json({ threads: threadsWithLastMessage });
});

// Create new chat thread
chatRouter.post('/chat/threads', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({ title: z.string().min(1).max(100).optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const thread = await prisma.chatThread.create({
    data: { 
      userId: req.userId!, 
      title: parsed.data.title || 'New Chat'
    }
  });
  res.status(201).json({ thread });
});

// Get messages in a thread
chatRouter.get('/chat/threads/:threadId/messages', requireAuth, async (req: AuthRequest, res) => {
  const { threadId } = req.params;
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, userId: req.userId! }
  });
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  
  const messages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: 'asc' }
  });
  res.json({ messages });
});

// Send message to AI
chatRouter.post('/chat/message', requireAuth, async (req: AuthRequest, res) => {
  const schema = z.object({
    threadId: z.string().min(1),
    content: z.string().min(1).max(2000)
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  
  const { threadId, content } = parsed.data;
  
  // Verify thread ownership
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, userId: req.userId! }
  });
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  
  // Store user message
  const userMessage = await prisma.chatMessage.create({
    data: { threadId, role: 'user', content }
  });
  
  // Get conversation history for context
  const recentMessages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  const conversationHistory = recentMessages.reverse().map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content
  }));
  
  // Generate AI response
  const aiResponse = await generateAIResponse(content, conversationHistory);
  
  const assistantMessage = await prisma.chatMessage.create({
    data: { threadId, role: 'assistant', content: aiResponse }
  });
  
  // Update thread timestamp
  await prisma.chatThread.update({
    where: { id: threadId },
    data: { updatedAt: new Date() }
  });
  
  res.json({ 
    userMessage, 
    assistantMessage 
  });
});

// Delete chat thread
chatRouter.delete('/chat/threads/:threadId', requireAuth, async (req: AuthRequest, res) => {
  const { threadId } = req.params;
  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, userId: req.userId! }
  });
  if (!thread) return res.status(404).json({ error: 'Thread not found' });
  
  await prisma.chatThread.delete({ where: { id: threadId } });
  res.json({ ok: true });
});

