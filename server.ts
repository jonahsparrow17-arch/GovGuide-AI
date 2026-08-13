import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { getAllServices, getServiceBySlug, searchServices } from './src/db/database.js';
import { processChatQuery } from './src/services/aiService.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // REST API Endpoints

  // 1. Health
  app.get('/api/health', (req, res) => {
    res.json({ status: 'GovGuide AI is running', timestamp: new Date().toISOString() });
  });

  // 2. Search Services Query Endpoint
  app.get('/api/search', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      if (!q.trim()) {
        const all = await getAllServices();
        return res.json(all);
      }
      const results = await searchServices(q.trim());
      res.json(results);
    } catch (error: any) {
      console.error('Error searching services:', error);
      res.status(500).json({ error: 'Failed to search services' });
    }
  });

  // 3. List Services
  app.get('/api/services', async (req, res) => {

    try {
      const services = await getAllServices();
      res.json(services);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Failed to retrieve government services' });
    }
  });

  // 3. Service Details by Slug
  app.get('/api/services/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const service = await getServiceBySlug(slug);
      if (!service) {
        return res.status(404).json({ error: `Service '${slug}' not found` });
      }
      res.json(service);
    } catch (error: any) {
      console.error(`Error fetching service '${req.params.slug}':`, error);
      res.status(500).json({ error: 'Failed to retrieve service details' });
    }
  });

  // 4. AI Chat
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, serviceSlug } = req.body;
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await processChatQuery(message.trim(), serviceSlug);
      res.json(response);
    } catch (error: any) {
      console.error('Error in AI Chat API:', error);
      res.status(500).json({
        answer: 'An unexpected error occurred while processing your query. Please try again later.',
        source: 'https://india.gov.in'
      });
    }
  });

  // Vite middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GovGuide AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
