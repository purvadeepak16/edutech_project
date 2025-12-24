const API_URL = import.meta.env.VITE_API_URL || '/api';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId: string | null;
  color: string;
}

interface MindMap {
  _id: string;
  userId: string;
  title: string;
  nodes: MindMapNode[];
  createdAt: string;
  updatedAt: string;
}

interface MindMapListItem {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('sc_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const mindmapApi = {
  // Get all mind maps
  getAll: async (): Promise<MindMapListItem[]> => {
    const response = await fetch(`${API_URL}/mindmaps`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch mind maps');
    return response.json();
  },

  // Get a specific mind map
  get: async (id: string): Promise<MindMap> => {
    const response = await fetch(`${API_URL}/mindmaps/${id}`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch mind map');
    return response.json();
  },

  // Create a new mind map
  create: async (title: string, nodes: MindMapNode[]): Promise<MindMap> => {
    const response = await fetch(`${API_URL}/mindmaps`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ title, nodes })
    });
    if (!response.ok) throw new Error('Failed to create mind map');
    return response.json();
  },

  // Update a mind map
  update: async (id: string, title: string, nodes: MindMapNode[]): Promise<MindMap> => {
    const response = await fetch(`${API_URL}/mindmaps/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ title, nodes })
    });
    if (!response.ok) throw new Error('Failed to update mind map');
    return response.json();
  },

  // Delete a mind map
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/mindmaps/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete mind map');
  }
};
