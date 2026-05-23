import mongoose, { Schema, Document } from 'mongoose';

// Interface matching the frontend FileNode
export interface IFileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: IFileNode[];
  language?: string;
  path: string;
}

export interface IProject extends Document {
  name: string;
  description: string;
  files: IFileNode[];
  createdAt: Date;
  updatedAt: Date;
}

const fileNodeSchema = new Schema<IFileNode>({
  name: { type: String, required: true },
  type: { type: String, enum: ['file', 'directory'], required: true },
  content: { type: String },
  language: { type: String },
  path: { type: String, required: true }
});
fileNodeSchema.add({
  children: [fileNodeSchema]
});

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, default: 'Untitled Project' },
    description: { type: String, default: '' },
    files: [fileNodeSchema]
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', projectSchema);

// User Session Audit Schema
export interface IAuditEntry {
  timestamp: number;
  type: 'file_change' | 'terminal_command' | 'file_create' | 'file_delete' | 'package_install';
  path?: string;
  content?: string;
  command?: string;
  metadata?: mongoose.Schema.Types.Mixed;
}

export interface ISessionAudit extends Document {
  projectId: mongoose.Types.ObjectId;
  candidateId: string;
  entries: IAuditEntry[];
  startedAt: Date;
  endedAt?: Date;
  assessmentResult?: mongoose.Schema.Types.Mixed;
}

const auditEntrySchema = new Schema<IAuditEntry>({
  timestamp: { type: Number, required: true },
  type: { type: String, required: true },
  path: String,
  content: String,
  command: String,
  metadata: Schema.Types.Mixed
});

const sessionAuditSchema = new Schema<ISessionAudit>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    candidateId: { type: String, required: true },
    entries: [auditEntrySchema],
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    assessmentResult: Schema.Types.Mixed
  },
  { timestamps: true }
);

export const SessionAudit = mongoose.model<ISessionAudit>('SessionAudit', sessionAuditSchema);
