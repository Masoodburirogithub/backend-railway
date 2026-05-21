// backend/src/controllers/caseStudyController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const ensureUploadDir = () => {
  const uploadDir = path.join(__dirname, '../../uploads/case-studies');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Save base64 image to file
const saveImage = (base64String, id) => {
  try {
    if (!base64String || !base64String.startsWith('data:image')) {
      return base64String;
    }
    
    // Extract image type and data
    const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error('Invalid base64 format');
      return null;
    }
    
    const imageType = matches[1];
    const imageData = matches[2];
    const buffer = Buffer.from(imageData, 'base64');
    
    // Check file size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      console.error('Image too large:', buffer.length);
      return null;
    }
    
    // Create filename and save path
    const filename = `${id}_${Date.now()}.${imageType}`;
    const uploadDir = ensureUploadDir();
    const filepath = path.join(uploadDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    console.log('Image saved:', filepath);
    
    // Return the URL path (without domain)
    return `/uploads/case-studies/${filename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
};

// Get all case studies
const getCaseStudies = async (req, res) => {
  try {
    const caseStudies = await prisma.caseStudy.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
    
    res.json({
      success: true,
      data: caseStudies,
      count: caseStudies.length
    });
  } catch (error) {
    console.error('Get case studies error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single case study
const getCaseStudyById = async (req, res) => {
  try {
    const { id } = req.params;
    const caseStudy = await prisma.caseStudy.findUnique({
      where: { id }
    });
    
    if (!caseStudy) {
      return res.status(404).json({ success: false, error: 'Case study not found' });
    }
    
    res.json({ success: true, data: caseStudy });
  } catch (error) {
    console.error('Get case study error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create case study
const createCaseStudy = async (req, res) => {
  try {
    const { title, subtitle, industry, technology, challenge, solution, result, imageUrl, displayOrder } = req.body;
    
    console.log('Creating case study with image:', imageUrl ? 'Has image' : 'No image');
    
    // Validate required fields
    if (!title || !industry || !technology || !challenge || !solution || !result) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    let savedImageUrl = null;
    
    // Handle image upload
    if (imageUrl && imageUrl.startsWith('data:image')) {
      const tempId = Date.now().toString();
      savedImageUrl = saveImage(imageUrl, tempId);
      console.log('Saved image URL:', savedImageUrl);
    } else if (imageUrl && imageUrl.startsWith('http')) {
      savedImageUrl = imageUrl;
    } else if (imageUrl) {
      savedImageUrl = imageUrl;
    }
    
    const caseStudy = await prisma.caseStudy.create({
      data: {
        title,
        subtitle: subtitle || null,
        industry,
        technology,
        challenge,
        solution,
        result,
        imageUrl: savedImageUrl,
        displayOrder: displayOrder || 0,
        isActive: true
      }
    });
    
    res.status(201).json({
      success: true,
      data: caseStudy,
      message: 'Case study created successfully'
    });
  } catch (error) {
    console.error('Create case study error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update case study
const updateCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, industry, technology, challenge, solution, result, imageUrl, displayOrder, isActive } = req.body;
    
    console.log('Updating case study:', id, 'Image URL:', imageUrl ? 'Has image' : 'No image');
    
    // Get existing case study
    const existingCaseStudy = await prisma.caseStudy.findUnique({ where: { id } });
    if (!existingCaseStudy) {
      return res.status(404).json({ success: false, error: 'Case study not found' });
    }
    
    let savedImageUrl = existingCaseStudy.imageUrl;
    
    // Handle new image upload
    if (imageUrl && imageUrl.startsWith('data:image')) {
      savedImageUrl = saveImage(imageUrl, id);
      console.log('New image saved URL:', savedImageUrl);
    } else if (imageUrl === '') {
      savedImageUrl = null;
    } else if (imageUrl && imageUrl.startsWith('http')) {
      savedImageUrl = imageUrl;
    } else if (imageUrl) {
      savedImageUrl = imageUrl;
    }
    
    const caseStudy = await prisma.caseStudy.update({
      where: { id },
      data: {
        title: title || existingCaseStudy.title,
        subtitle: subtitle !== undefined ? subtitle : existingCaseStudy.subtitle,
        industry: industry || existingCaseStudy.industry,
        technology: technology || existingCaseStudy.technology,
        challenge: challenge || existingCaseStudy.challenge,
        solution: solution || existingCaseStudy.solution,
        result: result || existingCaseStudy.result,
        imageUrl: savedImageUrl,
        displayOrder: displayOrder !== undefined ? displayOrder : existingCaseStudy.displayOrder,
        isActive: isActive !== undefined ? isActive : existingCaseStudy.isActive
      }
    });
    
    res.json({
      success: true,
      data: caseStudy,
      message: 'Case study updated successfully'
    });
  } catch (error) {
    console.error('Update case study error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete case study
const deleteCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get case study to delete its image
    const caseStudy = await prisma.caseStudy.findUnique({ where: { id } });
    
    // Delete image file if it exists locally
    if (caseStudy?.imageUrl && caseStudy.imageUrl.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '../../', caseStudy.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image:', imagePath);
      }
    }
    
    await prisma.caseStudy.delete({ where: { id } });
    
    res.json({ success: true, message: 'Case study deleted successfully' });
  } catch (error) {
    console.error('Delete case study error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getCaseStudies,
  getCaseStudyById,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy
};