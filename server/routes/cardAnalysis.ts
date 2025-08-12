import type { Express } from "express";
import { analyzeAllMatches, generateCardUsageReport } from "../utils/cardAnalyzer";
import { generateDetailedCardAnalysis, generateCardReport, generateGlobalCardStats } from "../utils/manualCardAnalysis";
import { generateCardAnalysisFromData } from "../utils/simpleCardReport";

export function registerCardAnalysisRoutes(app: Express) {
  // Endpoint para obtener análisis de cartas de todas las partidas
  app.get('/api/card-analysis', async (req, res) => {
    try {
      const analyses = await analyzeAllMatches();
      res.json(analyses);
    } catch (error) {
      console.error('Error in card analysis:', error);
      res.status(500).json({ error: 'Failed to analyze cards' });
    }
  });

  // Endpoint para obtener reporte en texto plano
  app.get('/api/card-analysis/report', async (req, res) => {
    try {
      const analyses = await analyzeAllMatches();
      const report = generateCardUsageReport(analyses);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(report);
    } catch (error) {
      console.error('Error generating card report:', error);
      res.status(500).json({ error: 'Failed to generate card report' });
    }
  });

  // Endpoint para análisis detallado basado en logs completos
  app.get('/api/card-analysis/detailed', async (req, res) => {
    try {
      const analyses = await generateDetailedCardAnalysis();
      res.json(analyses);
    } catch (error) {
      console.error('Error in detailed card analysis:', error);
      res.status(500).json({ error: 'Failed to generate detailed card analysis' });
    }
  });

  // Endpoint para reporte detallado en texto
  app.get('/api/card-analysis/detailed-report', async (req, res) => {
    try {
      const analyses = await generateDetailedCardAnalysis();
      const report = generateCardReport(analyses);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(report);
    } catch (error) {
      console.error('Error generating detailed card report:', error);
      res.status(500).json({ error: 'Failed to generate detailed card report' });
    }
  });

  // Endpoint para estadísticas globales de cartas
  app.get('/api/card-analysis/global-stats', async (req, res) => {
    try {
      const analyses = await generateDetailedCardAnalysis();
      const report = generateGlobalCardStats(analyses);
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(report);
    } catch (error) {
      console.error('Error generating global card stats:', error);
      res.status(500).json({ error: 'Failed to generate global card stats' });
    }
  });

  // Endpoint para análisis manual simplificado
  app.get('/api/card-analysis/manual', async (req, res) => {
    try {
      const report = generateCardAnalysisFromData();
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.send(report);
    } catch (error) {
      console.error('Error generating manual card analysis:', error);
      res.status(500).json({ error: 'Failed to generate manual card analysis' });
    }
  });
}