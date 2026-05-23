import { Request, Response } from 'express';
import { SessionAudit, Project } from '../models';

export const aiController = {
  assessSession: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      
      const session = await SessionAudit.findById(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      const project = await Project.findById(session.projectId);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      // MOCK LLM IMPLEMENTATION
      // Analyzing session entries for activity
      const fileChanges = session.entries.filter((e: any) => e.type === 'file_change').length;
      const commandsRun = session.entries.filter((e: any) => e.type === 'terminal_command').length;
      
      const hasNpmInstall = session.entries.some((e: any) => e.command?.includes('npm install'));
      const hasDevServer = session.entries.some((e: any) => e.command?.includes('npm run dev'));

      let confidenceScore = 50;
      const strengths = [];
      const weaknesses = [];
      const nextBestActions = [];

      if (hasNpmInstall && hasDevServer) {
        confidenceScore += 20;
        strengths.push('Successfully set up and ran the development environment.');
      } else {
        weaknesses.push('Failed to install dependencies or run the development server.');
        nextBestActions.push('Ask candidate to explain how they usually run a React project.');
      }

      if (fileChanges > 5) {
        confidenceScore += 15;
        strengths.push('Actively engaged with the codebase and made multiple modifications.');
      }

      const assessmentResult: any = {
        confidenceScore: Math.min(100, confidenceScore),
        riskLevel: confidenceScore > 75 ? 'low' : confidenceScore > 50 ? 'medium' : 'high',
        categories: {
          codeQuality: 70,
          stateManagement: 60,
          errorHandling: 50,
          projectStructure: 80,
          completeness: 65
        },
        strengths,
        weaknesses,
        nextBestActions,
        summary: `The candidate made ${fileChanges} file changes and ran ${commandsRun} terminal commands.`
      };

      session.assessmentResult = assessmentResult;
      session.endedAt = new Date();
      await session.save();

      res.json(assessmentResult);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};
