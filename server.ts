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
  searchUnified,
  getSchemeCategoriesWithCounts,
  checkEligibilityRules,
  getOfficialSources,
  getChecklists,
  getChecklistById,
  createChecklist,
  updateChecklistItem,
  deleteChecklist,
  adminUpdateVerification,
  adminUpdateScheme
} from './src/db/database.js';
import { processChatQuery } from './src/services/aiService.js';

dotenv.config();

// Admin Authentication Middleware
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || (req.headers as any)['authorization'] || (req.headers as any)['Authorization'];
  const adminSecret = (req.headers['x-admin-token'] as string) ||
                      (req.headers['X-Admin-Token'] as string) ||
                      (authHeader && authHeader.toLowerCase().startsWith('bearer ') ? authHeader.substring(7).trim() : null);

  const validToken = process.env.ADMIN_TOKEN || 'govguide-admin-secret-key-2026';

  if (!adminSecret || adminSecret.trim() !== validToken.trim()) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin authorization required. Provide a valid Bearer token or x-admin-token header.'
      }
    });
  }
  next();
}

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
      status: 'healthy',
      application: 'GovGuide AI',
      version: '4.0.0',
      project_identity: 'Independent Civic-Tech Educational Platform',
      tagline: 'Understand. Prepare. Navigate.',
      database: 'SQLite (sql.js) embedded relational',
      timestamp: new Date().toISOString()
    });
  });

  // 2. Interactive API Documentation
  app.get('/api/docs', (req, res) => {
    res.json({
      openapi: '3.0.0',
      info: {
        title: 'GovGuide AI API v4',
        version: '4.0.0',
        description: 'REST API for government services, welfare schemes, structured eligibility checks, and AI civic guidance.'
      },
      endpoints: [
        { method: 'GET', path: '/api/health', description: 'System health & metadata' },
        { method: 'GET', path: '/api/search?q={query}', description: 'Unified search across 5 core services and all schemes' },
        { method: 'GET', path: '/api/services', description: 'List all 5 core government services' },
        { method: 'GET', path: '/api/services/:slug', description: 'Retrieve comprehensive service details by slug' },
        { method: 'GET', path: '/api/schemes', description: 'List welfare schemes with optional ?category= and ?status= filters' },
        { method: 'GET', path: '/api/schemes/categories', description: 'Get all 8 scheme categories with verified real database counts' },
        { method: 'GET', path: '/api/schemes/:slug', description: 'Retrieve detailed scheme specifications by slug' },
        { method: 'POST', path: '/api/eligibility/check', description: 'Structured rule engine eligibility evaluation' },
        { method: 'POST', path: '/api/recommendations', description: 'Find Schemes for Me recommendation engine' },
        { method: 'POST', path: '/api/chat', description: 'Grounded AI civic assistant with source verification' },
        { method: 'GET', path: '/api/sources', description: 'List official government source domains and verification timestamps' },
        { method: 'GET', path: '/api/checklists', description: 'Retrieve persisted checklists' },
        { method: 'POST', path: '/api/checklists', description: 'Create a new persisted document checklist' },
        { method: 'PATCH', path: '/api/checklists/:id/items/:itemId', description: 'Toggle checklist item completion' },
        { method: 'DELETE', path: '/api/checklists/:id', description: 'Delete a checklist' },
        { method: 'PATCH', path: '/api/admin/verification/:id', description: 'Update source verification status (Admin protected)' }
      ]
    });
  });

  // 3. Unified Search Endpoint
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
      res.status(500).json({
        success: false,
        error: { code: 'SEARCH_FAILED', message: 'Failed to perform search query' }
      });
    }
  });

  // 4. List All Core Services (5 Services)
  app.get('/api/services', async (req, res) => {
    try {
      const services = await getAllServices();
      res.json(services);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVICE_DATA_UNAVAILABLE', message: 'Failed to retrieve government services' }
      });
    }
  });

  // 5. Service Details by Slug
  app.get('/api/services/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const service = await getServiceBySlug(slug);
      if (!service) {
        return res.status(404).json({
          success: false,
          error: { code: 'SERVICE_NOT_FOUND', message: `Government service '${slug}' not found` }
        });
      }
      res.json(service);
    } catch (error: any) {
      console.error(`Error fetching service '${req.params.slug}':`, error);
      res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve service details' }
      });
    }
  });

  // 6. Scheme Categories with Real Counts
  app.get(['/api/schemes/categories', '/api/v1/schemes/categories'], async (req, res) => {
    try {
      const categories = await getSchemeCategoriesWithCounts();
      res.json(categories);
    } catch (error: any) {
      console.error('Error fetching scheme categories:', error);
      res.status(500).json({
        success: false,
        error: { code: 'CATEGORIES_UNAVAILABLE', message: 'Failed to retrieve scheme categories' }
      });
    }
  });

  // 7. List Government Schemes
  app.get('/api/schemes', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const status = req.query.status as string | undefined;
      const schemes = await getAllSchemes(category, status);
      res.json(schemes);
    } catch (error: any) {
      console.error('Error fetching schemes:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SCHEME_DATA_UNAVAILABLE', message: 'Failed to retrieve government schemes' }
      });
    }
  });

  // 8. Scheme Details by Slug
  app.get('/api/schemes/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const scheme = await getSchemeBySlug(slug);
      if (!scheme) {
        return res.status(404).json({
          success: false,
          error: { code: 'SCHEME_NOT_FOUND', message: `Government scheme '${slug}' not found` }
        });
      }
      res.json(scheme);
    } catch (error: any) {
      console.error(`Error fetching scheme '${req.params.slug}':`, error);
      res.status(500).json({
        success: false,
        error: { code: 'DATABASE_ERROR', message: 'Failed to retrieve scheme details' }
      });
    }
  });

  // 9. Structured Eligibility Rule Evaluation
  app.post(['/api/eligibility/check', '/api/v1/eligibility/check'], async (req, res) => {
    try {
      const criteria = req.body;
      if (!criteria || typeof criteria !== 'object') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_CRITERIA', message: 'Eligibility request criteria payload is required' }
        });
      }
      const evaluations = await checkEligibilityRules(criteria);
      res.json({
        success: true,
        criteria,
        evaluatedCount: evaluations.length,
        disclaimer: 'You may be eligible based on the criteria provided. Please verify the current official requirements on the designated official government portal.',
        results: evaluations
      });
    } catch (error: any) {
      console.error('Error checking eligibility:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ELIGIBILITY_ENGINE_ERROR', message: 'Failed to evaluate eligibility rules' }
      });
    }
  });

  // 10. Recommendations / Find Schemes for Me
  app.post(['/api/recommendations', '/api/v1/recommendations', '/api/schemes/find'], async (req, res) => {
    try {
      const profile = req.body;
      if (!profile || typeof profile !== 'object') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PROFILE', message: 'Citizen profile payload is required' }
        });
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
      res.status(500).json({
        success: false,
        error: { code: 'RECOMMENDATION_ERROR', message: 'Failed to match schemes' }
      });
    }
  });

  // 11. AI Chat Assistant (RAG Grounded)
  app.post(['/api/chat', '/api/v1/ai/chat', '/api/ai/chat'], async (req, res) => {
    try {
      const { message, serviceSlug } = req.body;
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          success: false,
          error: { code: 'EMPTY_MESSAGE', message: 'Message string is required' }
        });
      }

      const response = await processChatQuery(message.trim(), serviceSlug);
      res.json({
        success: true,
        answer: response.answer,
        service: response.service,
        source: response.source,
        suggestedQuestions: response.suggestedQuestions,
        sources: [response.source || 'https://india.gov.in'],
        disclaimer: 'GovGuide AI is an independent educational tool and not an official government service. Verify all procedures on official government portals.'
      });
    } catch (error: any) {
      console.error('Error in AI Chat API:', error);
      res.status(503).json({
        success: false,
        error: { code: 'AI_SERVICE_UNAVAILABLE', message: 'AI civic guide is temporarily unavailable' },
        answer: 'I could not connect to the verification engine right now. For authoritative government assistance, please consult official portals at india.gov.in or tn.gov.in.',
        source: 'https://india.gov.in'
      });
    }
  });

  // 12. Official Sources & Verification Records
  app.get(['/api/sources', '/api/v1/sources'], async (req, res) => {
    try {
      const sources = await getOfficialSources();
      res.json(sources);
    } catch (error: any) {
      console.error('Error fetching sources:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SOURCES_UNAVAILABLE', message: 'Failed to retrieve official sources' }
      });
    }
  });

  // 13. Persistent Document Checklists
  app.get('/api/checklists', async (req, res) => {
    try {
      const checklists = await getChecklists();
      res.json(checklists);
    } catch (error: any) {
      console.error('Error fetching checklists:', error);
      res.status(500).json({
        success: false,
        error: { code: 'CHECKLIST_FETCH_ERROR', message: 'Failed to load checklists' }
      });
    }
  });

  app.get('/api/checklists/:id', async (req, res) => {
    try {
      const checklist = await getChecklistById(req.params.id);
      if (!checklist) {
        return res.status(404).json({
          success: false,
          error: { code: 'CHECKLIST_NOT_FOUND', message: 'Checklist not found' }
        });
      }
      res.json(checklist);
    } catch (error: any) {
      console.error('Error fetching checklist by ID:', error);
      res.status(500).json({
        success: false,
        error: { code: 'CHECKLIST_FETCH_ERROR', message: 'Failed to retrieve checklist' }
      });
    }
  });

  app.post('/api/checklists', async (req, res) => {
    try {
      const data = req.body;
      if (!data || !data.title) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_CHECKLIST_DATA', message: 'Checklist title is required' }
        });
      }
      const created = await createChecklist(data);
      res.status(201).json(created);
    } catch (error: any) {
      console.error('Error creating checklist:', error);
      res.status(500).json({
        success: false,
        error: { code: 'CHECKLIST_CREATE_ERROR', message: 'Failed to persist checklist' }
      });
    }
  });

  app.patch('/api/checklists/:id/items/:itemId', async (req, res) => {
    try {
      const { id, itemId } = req.params;
      const { completed } = req.body;
      await updateChecklistItem(id, itemId, Boolean(completed));
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error updating checklist item:', error);
      res.status(500).json({
        success: false,
        error: { code: 'CHECKLIST_UPDATE_ERROR', message: 'Failed to update checklist item' }
      });
    }
  });

  app.delete('/api/checklists/:id', async (req, res) => {
    try {
      await deleteChecklist(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting checklist:', error);
      res.status(500).json({
        success: false,
        error: { code: 'CHECKLIST_DELETE_ERROR', message: 'Failed to delete checklist' }
      });
    }
  });

  // 14. Admin Management APIs (Protected)
  app.patch('/api/admin/verification/:id', requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_STATUS', message: 'Verification status is required' }
        });
      }
      await adminUpdateVerification(id, status, notes);
      res.json({ success: true, message: `Source '${id}' verification status updated to '${status}'` });
    } catch (error: any) {
      console.error('Error updating verification status:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ADMIN_UPDATE_ERROR', message: 'Failed to update verification record' }
      });
    }
  });

  app.put('/api/admin/schemes/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const data = req.body;
      await adminUpdateScheme(id, data);
      res.json({ success: true, message: `Scheme ${id} updated successfully` });
    } catch (error: any) {
      console.error('Error updating scheme:', error);
      res.status(500).json({
        success: false,
        error: { code: 'ADMIN_SCHEME_ERROR', message: 'Failed to update scheme record' }
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
    console.log(`GovGuide AI v4 backend server running on http://localhost:${PORT}`);
  });
}

startServer();

