export interface Task
{
    id: number ;
    title : string;
    description? : string;
    status: string;
    priority: string;
    dueDate? : string;
    projectId : number;

    assigneeId? : number;

    createAt: string;
    updatedAt: string;
}