export class WorkflowError extends Error { constructor(status,message){super(message);this.name='WorkflowError';this.status=status;} }
