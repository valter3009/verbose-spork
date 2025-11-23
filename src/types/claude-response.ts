export interface Button {
  text: string;
  emoji: string;
  action: string;
  priority: number;
  params: Record<string, any>;
}

export interface ResponseData {
  text: string;
  buttons: Button[];
}

export interface FieldDefinition {
  type: 'integer' | 'float' | 'text' | 'date' | 'datetime' | 'boolean' | 'jsonb';
  description: string;
  required: boolean;
  default?: any;
}

export interface SchemaDefinition {
  category: string;
  subcategory?: string;
  description: string;
  fields: Record<string, FieldDefinition>;
  indexes?: string[];
  relationships?: any[];
}

export interface SchemaDecision {
  needs_new_schema: boolean;
  storage_type?: 'table' | 'jsonb';
  reason?: string;
  schema?: SchemaDefinition;
}

export interface ActionParams {
  type: string;
  params: Record<string, any>;
}

export interface Metadata {
  confidence: number;
  needs_clarification: boolean;
  clarification_question: string | null;
}

export interface ClaudeResponse {
  intent: 'create' | 'read' | 'update' | 'delete' | 'analyze' | 'question';
  category: string;
  subcategory: string | null;
  action: ActionParams;
  schema_decision: SchemaDecision;
  extracted_data: Record<string, any>;
  response: ResponseData;
  metadata: Metadata;
}
