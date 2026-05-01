const express = require('express');
const Notice = require('../models/Notice');
const User = require('../models/User');
const auth = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');

const router = express.Router();

// Get all notices with filters
router.get('/', async (req, res) => {
  try {
    const { category, status, visibility, priority } = req.query;
    const filter = { status: 'approved' };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (visibility) filter.visibility = visibility;
    if (priority) filter.priority = priority;

    // Filter expired notices
    filter.$or = [
      { expiryDate: null },
      { expiryDate: { $gte: new Date() } }
    ];

    const notices = await Notice.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create notice (Authenticated users)
 * Fixes:
 * - normalize fields that sometimes arrive as arrays (from multipart parsing / form encoding)
 * - set required authorName from User.name (JWT only provides userId+role)
 * - coerce invalid expiryDate into null
 * - auto-approve notices so admin approval is no longer required
 */
router.post('/', auth, uploadMiddleware.processUploads, async (req, res) => {
  try {
    const first = (v) => (Array.isArray(v) ? v[0] : v);

    let {
      title,
      content,
      category,
      visibility,
      priority,
      expiryDate,
      thumbnailImage,
      attachments,
    } = req.body;

    title = first(title);
    content = first(content);
    category = first(category);
    visibility = first(visibility);
    priority = first(priority);

    title = title != null ? String(title).trim() : title;
    content = content != null ? String(content).trim() : content;
    category = category != null ? String(category).trim() : category;
    visibility = visibility != null ? String(visibility).trim() : visibility;
    priority = priority != null ? String(priority).trim() : priority;

    const parsedExpiry = expiryDate ? new Date(first(expiryDate)) : null;
    const expiryDateValue =
      parsedExpiry && !Number.isNaN(parsedExpiry.getTime()) ? parsedExpiry : null;

    // authorName is required by the Notice schema; JWT doesn't include it
    const authorUser = await User.findById(req.user.userId).select('name').lean();
    const authorNameValue = authorUser?.name;

    const notice = new Notice({
      title,
      content,
      category,
      visibility: visibility || 'internal',
      priority: priority || 'medium',
      expiryDate: expiryDateValue,
      author: req.user.userId,
      authorName: authorNameValue,
      thumbnailImage: thumbnailImage || null,
      attachments: Array.isArray(attachments) ? attachments : attachments ? [attachments] : [],
      status: 'approved',
    });

    await notice.save();
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending notices (Admin only)
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const notices = await Notice.find({ status: 'pending_approval' })
      .populate('author', 'name email faculty')
      .sort({ createdAt: -1 });

    res.json(notices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve notice (Admin only)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'approved',
        approvedBy: req.user.userId,
        approvalDate: new Date()
      },
      { new: true }
    );

    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject notice (Admin only)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { reason } = req.body;
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason
      },
      { new: true }
    );

    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single notice
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).populate('author', 'name email faculty');

    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update notice (Author or Admin)
 * Normalize array-to-scalar fields coming from multipart/form parsing.
 */
router.put('/:id', auth, uploadMiddleware.processUploads, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    if (notice.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const first = (v) => (Array.isArray(v) ? v[0] : v);

    const {
      title,
      content,
      category,
      priority,
      visibility,
      expiryDate,
      tags,
      targetAudience,
      displayLocation,
    } = req.body;

    const updateData = {
      ...req.body,
      title: title != null ? String(first(title)).trim() : title,
      content: content != null ? String(first(content)).trim() : content,
      category: category != null ? String(first(category)).trim() : category,
      priority: priority != null ? String(first(priority)).trim() : priority,
      visibility: visibility != null ? String(first(visibility)).trim() : visibility,
    };

    const parsedExpiry = expiryDate ? new Date(first(expiryDate)) : null;
    updateData.expiryDate =
      parsedExpiry && !Number.isNaN(parsedExpiry.getTime()) ? parsedExpiry : null;

    if (tags != null) {
      updateData.tags = Array.isArray(tags) ? tags : String(tags).split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (targetAudience != null) {
      updateData.targetAudience = Array.isArray(targetAudience) ? targetAudience : [String(targetAudience)];
    }
    if (displayLocation != null) {
      updateData.displayLocation = Array.isArray(displayLocation) ? displayLocation : [String(displayLocation)];
    }

    // Ensure we don't accidentally wipe required fields via normalization
    const updated = await Notice.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notice (Author or Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (notice.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
