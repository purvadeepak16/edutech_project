import express from 'express';
import MindMap from '../models/MindMap';
import { protect } from '../middleware/auth';

const router = express.Router();

// Get all mind maps for current user
router.get('/', protect, async (req, res) => {
  try {
    const mindMaps = await MindMap.find({ userId: req.user!.id })
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt');
    res.json(mindMaps);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific mind map
router.get('/:id', protect, async (req, res) => {
  try {
    const mindMap = await MindMap.findOne({ 
      _id: req.params.id, 
      userId: req.user!.id 
    });
    
    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found' });
    }
    
    res.json(mindMap);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new mind map
router.post('/', protect, async (req, res) => {
  try {
    const { title, nodes } = req.body;
    
    if (!title || !nodes || !Array.isArray(nodes)) {
      return res.status(400).json({ message: 'Title and nodes are required' });
    }
    
    const mindMap = new MindMap({
      userId: req.user!.id,
      title,
      nodes
    });
    
    await mindMap.save();
    res.status(201).json(mindMap);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a mind map
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, nodes } = req.body;
    
    const mindMap = await MindMap.findOne({ 
      _id: req.params.id, 
      userId: req.user!.id 
    });
    
    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found' });
    }
    
    if (title) mindMap.title = title;
    if (nodes) mindMap.nodes = nodes;
    
    await mindMap.save();
    res.json(mindMap);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a mind map
router.delete('/:id', protect, async (req, res) => {
  try {
    const mindMap = await MindMap.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user!.id 
    });
    
    if (!mindMap) {
      return res.status(404).json({ message: 'Mind map not found' });
    }
    
    res.json({ message: 'Mind map deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
