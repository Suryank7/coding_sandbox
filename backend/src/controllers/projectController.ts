import { Request, Response } from 'express';
import { z } from 'zod';
import { Project, SessionAudit } from '../models';

// Validation Schemas
const fileNodeZod: z.ZodType<any> = z.lazy(() => z.object({
  name: z.string(),
  type: z.enum(['file', 'directory']),
  content: z.string().optional(),
  language: z.string().optional(),
  path: z.string(),
  children: z.array(z.lazy(() => fileNodeZod)).optional()
}));

const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  files: z.array(fileNodeZod)
});

const updateFileContentSchema = z.object({
  path: z.string(),
  content: z.string()
});

const auditEntrySchema = z.object({
  timestamp: z.number(),
  type: z.enum(['file_change', 'terminal_command', 'file_create', 'file_delete', 'package_install']),
  path: z.string().optional(),
  content: z.string().optional(),
  command: z.string().optional()
});

export const projectController = {
  createProject: async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = createProjectSchema.parse(req.body);
      const project: any = await Project.create(validatedData);
      
      const candidateId = req.headers['x-candidate-id'] as string || 'anonymous';
      
      const session: any = await SessionAudit.create({
        projectId: project._id,
        candidateId: candidateId,
        entries: []
      });

      res.status(201).json({ project, sessionId: session._id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  },

  getProject: async (req: Request, res: Response): Promise<void> => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  updateFileContent: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { path, content } = updateFileContentSchema.parse(req.body);

      const project = await Project.findById(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const updateNode = (nodes: any[], targetPath: string, newContent: string): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].path === targetPath && nodes[i].type === 'file') {
            nodes[i].content = newContent;
            return true;
          }
          if (nodes[i].children && nodes[i].children.length > 0) {
            if (updateNode(nodes[i].children, targetPath, newContent)) return true;
          }
        }
        return false;
      };

      const filesUpdated = updateNode(project.files as any[], path, content);
      
      if (!filesUpdated) {
        res.status(404).json({ error: 'File not found in project' });
        return;
      }

      project.markModified('files');
      await project.save();

      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  },

  appendAuditLog: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const entry = auditEntrySchema.parse(req.body);

      const session = await SessionAudit.findById(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      session.entries.push(entry as any);
      await session.save();

      res.json({ success: true });
    } catch (error) {
       if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  },

  updateProjectTree: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const validatedData = z.object({ files: z.array(fileNodeZod) }).parse(req.body);

      const project = await Project.findByIdAndUpdate(
        id,
        { files: validatedData.files },
        { new: true }
      );

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      res.json({ success: true, project });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
};
