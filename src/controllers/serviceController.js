// backend/src/controllers/serviceController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all services (Public)
const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
    
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single service (Public)
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id }
    });
    
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    res.json({ success: true, data: service });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create service (Admin)
const createService = async (req, res) => {
  try {
    const { title, description, icon, features, gradient, color, displayOrder, isActive } = req.body;
    
    if (!title || !description || !icon) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    const service = await prisma.service.create({
      data: {
        title,
        description,
        icon,
        features: features || [],
        gradient: gradient || 'from-blue-500 to-indigo-500',
        color: color || 'blue',
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    
    res.status(201).json({
      success: true,
      data: service,
      message: 'Service created successfully'
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update service (Admin)
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, features, gradient, color, displayOrder, isActive } = req.body;
    
    const service = await prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        icon,
        features,
        gradient,
        color,
        displayOrder,
        isActive
      }
    });
    
    res.json({
      success: true,
      data: service,
      message: 'Service updated successfully'
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete service (Admin)
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    
    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};