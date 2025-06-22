export interface Category {
    _id: string;
    name: string;
    parentId: string | null;
    ancestors: string[];
    level: number;
    createdAt: string;
    updatedAt: string;
}
