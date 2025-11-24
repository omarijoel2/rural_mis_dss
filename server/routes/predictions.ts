import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  predictions,
  anomalyEvents,
  forecastData,
  nrwSnapshots,
  interventions,
} from '../../shared/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

const router = Router();

// GET: All predictions for a tenant
router.get('/predictions', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

    const allPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.tenantId, tenantId))
      .limit(100);

    res.json(allPredictions);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET: Asset failure predictions
router.get('/predictions/asset-failures', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

    const failures = await db
      .select()
      .from(predictions)
      .where(
        and(
          eq(predictions.tenantId, tenantId),
          eq(predictions.predictionType, 'failure'),
          gte(predictions.confidence, 70)
        )
      )
      .orderBy(desc(predictions.confidence))
      .limit(50);

    res.json(failures);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET: NRW anomaly alerts
router.get('/predictions/nrw-anomalies', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

    const anomalies = await db
      .select()
      .from(anomalyEvents)
      .where(eq(anomalyEvents.tenantId, tenantId))
      .orderBy(desc(anomalyEvents.createdAt))
      .limit(50);

    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET: Demand forecast for scheme
router.get('/predictions/demand-forecast/:schemeId', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { schemeId } = req.params;

    if (!tenantId || !schemeId) {
      return res.status(400).json({ error: 'Tenant ID and Scheme ID required' });
    }

    const forecast = await db
      .select()
      .from(forecastData)
      .where(
        and(
          eq(forecastData.tenantId, tenantId),
          eq(forecastData.schemeId, schemeId),
          eq(forecastData.forecastType, 'demand')
        )
      )
      .orderBy(forecastData.forecastDate)
      .limit(7);

    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST: Create prediction (for backend services)
router.post('/predictions', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const {
      entityType,
      entityId,
      predictionType,
      predictedValue,
      confidence,
      metadata,
      expiresAt,
    } = req.body;

    if (!tenantId || !entityType || !entityId || !predictionType) {
      return res
        .status(400)
        .json({ error: 'tenantId, entityType, entityId, predictionType required' });
    }

    const result = await db.insert(predictions).values({
      tenantId,
      entityType,
      entityId,
      predictionType,
      predictedValue,
      confidence: confidence || 0,
      metadata,
      expiresAt,
    });

    res.json({ success: true, id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET: NRW snapshots for DMA
router.get('/nrw-snapshots/:dmaId', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { dmaId } = req.params;

    if (!tenantId || !dmaId) {
      return res.status(400).json({ error: 'Tenant ID and DMA ID required' });
    }

    const snapshots = await db
      .select()
      .from(nrwSnapshots)
      .where(
        and(
          eq(nrwSnapshots.tenantId, tenantId),
          eq(nrwSnapshots.dmaId, dmaId)
        )
      )
      .orderBy(desc(nrwSnapshots.asOf))
      .limit(30);

    res.json(snapshots);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST: Record NRW snapshot
router.post('/nrw-snapshots', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { dmaId, asOf, systemInputVolumeMc, billedAuthorizedMc } = req.body;

    if (!tenantId || !dmaId || !asOf || !systemInputVolumeMc || !billedAuthorizedMc) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const waterLossMc = systemInputVolumeMc - billedAuthorizedMc;
    const nrwPercentage = (waterLossMc / systemInputVolumeMc) * 100;

    const result = await db.insert(nrwSnapshots).values({
      tenantId,
      dmaId,
      asOf: new Date(asOf),
      systemInputVolumeMc,
      billedAuthorizedMc,
      waterLossMc,
      nrwPercentage: Math.round(nrwPercentage),
    });

    res.json({ success: true, id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET: Interventions for DMA
router.get('/interventions/:dmaId', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { dmaId } = req.params;

    if (!tenantId || !dmaId) {
      return res.status(400).json({ error: 'Tenant ID and DMA ID required' });
    }

    const intv = await db
      .select()
      .from(interventions)
      .where(
        and(
          eq(interventions.tenantId, tenantId),
          eq(interventions.dmaId, dmaId)
        )
      )
      .orderBy(desc(interventions.startDate));

    res.json(intv);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST: Create intervention
router.post('/interventions', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { dmaId, type, startDate, estimatedCost, description } = req.body;

    if (!tenantId || !dmaId || !type || !startDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.insert(interventions).values({
      tenantId,
      dmaId,
      type,
      startDate: new Date(startDate),
      estimatedCost,
      description,
      status: 'planned',
    });

    res.json({ success: true, id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// GET: Anomaly events
router.get('/anomalies', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) return res.status(400).json({ error: 'Tenant ID required' });

    const anomalies = await db
      .select()
      .from(anomalyEvents)
      .where(eq(anomalyEvents.tenantId, tenantId))
      .orderBy(desc(anomalyEvents.createdAt))
      .limit(50);

    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// POST: Record anomaly
router.post('/anomalies', async (req: Request, res: Response) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const { entityType, entityId, anomalyType, anomalyScore, severity, details } = req.body;

    if (!tenantId || !entityType || !entityId || !anomalyType || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.insert(anomalyEvents).values({
      tenantId,
      entityType,
      entityId,
      anomalyType,
      anomalyScore,
      severity,
      details,
    });

    res.json({ success: true, id: result.lastID });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
