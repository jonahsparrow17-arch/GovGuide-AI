import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getAllServices,
  getServiceBySlug,
  searchServices,
  getAllSchemes,
  getSchemeBySlug,
  findSchemesForCitizen,
  searchUnified
} from './src/db/database.js';
import { processChatQuery } from './src/services/aiService.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // REST API Endpoints
  // -------------------------------------------------------------

  // 1. Health
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'GovGuide AI is running',
      version: '1.0',
      project_identity: 'Independent Civic-Tech Educational Platform',
      tagline: 'Understand. Prepare. Navigate.',
      timestamp: new Date().toISOString()
    });
  });

  // 2. Unified Search Endpoint
  app.get('/api/search', async (req, res) => {
    try {
      const q = (req.query.q as string) || '';
      if (!q.trim()) {
        const services = await getAllServices();
        const schemes = await getAllSchemes();
        return res.json({ services, schemes });
      }
      const results = await searchUnified(q.trim());
      res.json(results);
    } catch (error: any) {
      console.error('Error searching:', error);
      res.status(500).json({ error: 'Failed to perform search' });
    }
  });

  // 3. List All Core Services
  app.get('/api/services', async (req, res) => {
    try {
      const services = await getAllServices();
      res.json(services);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      res.status(500).json({ error: 'Failed to retrieve government services' });
    }
  });

  // 4. Service Details by Slug
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

  // 5. List Government Schemes (with optional category and status filters)
  app.get('/api/schemes', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const status = req.query.status as string | undefined;
      const schemes = await getAllSchemes(category, status);
      res.json(schemes);
    } catch (error: any) {
      console.error('Error fetching schemes:', error);
      res.status(500).json({ error: 'Failed to retrieve government schemes' });
    }
  });

  // 6. Scheme Details by Slug
  app.get('/api/schemes/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const scheme = await getSchemeBySlug(slug);
      if (!scheme) {
        return res.status(404).json({ error: `Scheme '${slug}' not found` });
      }
      res.json(scheme);
    } catch (error: any) {
      console.error(`Error fetching scheme '${req.params.slug}':`, error);
      res.status(500).json({ error: 'Failed to retrieve scheme details' });
    }
  });

  // 7. Find Schemes for Me (Wizard matching engine)
  app.post('/api/schemes/find', async (req, res) => {
    try {
      const profile = req.body;
      if (!profile || typeof profile !== 'object') {
        return res.status(400).json({ error: 'Citizen profile payload is required' });
      }
      const matches = await findSchemesForCitizen(profile);
      res.json({
        profile,
        matchedCount: matches.length,
        disclaimer: 'You may be eligible based on the information provided. Please verify the current official requirements on the designated official government portal.',
        results: matches
      });
    } catch (error: any) {
      console.error('Error matching schemes for citizen:', error);
      res.status(500).json({ error: 'Failed to match schemes' });
    }
  });

  // 8. AI Chat Assistant
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
        answer: 'An unexpected error occurred while processing your query. Please refer directly to official government portals at india.gov.in or tn.gov.in.',
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
    console.log(`GovGuide AI server running on http://localhost:${PORT}`);
  });
}

startServer();
