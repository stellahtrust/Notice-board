// backend/controllers/noticeController.js

const Notice = require('../models/Notice');
const { validationResult } = require('express-validator');

// Create Notice
exports.createNotice = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Validation failed',
      });
    }

    const {
      title,
      content,
      category,
      subcategory,
      priority,
      visibility,
      authorName,
      expiryDate,
      targetAudience,
      tags,
    } = req.body;

    // Ensure data is properly formatted
    const noticeData = {
      title: String(title).trim(),
      content: String(content).trim(),
      category: String(category).trim(),
      subcategory: subcategory ? String(subcategory).trim() : null,
      priority: priority || 'normal',
      visibility: visibility || 'internal',
      authorName: String(authorName).trim(),
      authorId: req.user.id,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      targetAudience: Array.isArray(targetAudience)
        ? targetAudience
        : [String(targetAudience)],
      tags: Array.isArray(tags)
        ? tags
        : String(tags)
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag),
    };

    // Validate arrays
    if (!Array.isArray(noticeData.targetAudience)) {
      noticeData.targetAudience = [noticeData.targetAudience];
    }

    if (!Array.isArray(noticeData.tags)) {
      noticeData.tags = [];
    }

    // Create notice
    const notice = new Notice(noticeData);
    await notice.save();

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      notice,
    });
  } catch (error) {
    console.error('Notice creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating notice',
      errors: error.errors
        ? Object.keys(error.errors).map((key) => ({
            field: key,
            message: error.errors[key].message,
          }))
        : [],
    });
  }
};

// Get All Notices
exports.getAllNotices = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status } = req.query;

    const filter = { status: 'approved' };

    if (category) {
      filter.category = category;
    }

    if (status && req.user?.role === 'admin') {
      filter.status = status;
    }

    const notices = await Notice.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('authorId', 'firstName lastName email');

    const total = await Notice.countDocuments(filter);

    res.status(200).json({
      success: true,
      notices,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Notice
exports.getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByIdAndUpdate(
        
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('authorId', 'firstName lastName email');

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      success: true,
      notice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Notice
exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      category,
      subcategory,
      priority,
      visibility,
      expiryDate,
      tags,
      targetAudience,
    } = req.body;

    const updateData = {};

    if (title) updateData.title = String(title).trim();
    if (content) updateData.content = String(content).trim();
    if (category) updateData.category = String(category).trim();
    if (subcategory) updateData.subcategory = String(subcategory).trim();
    if (priority) updateData.priority = priority;
    if (visibility) updateData.visibility = visibility;
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);
    if (tags) {
      updateData.tags = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(',')
            .map((tag) => tag.trim())
            .filter((tag) => tag);
    }
    if (targetAudience) {
      updateData.targetAudience = Array.isArray(targetAudience)
        ? targetAudience
        : [String(targetAudience)];
    }

    const notice = await Notice.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully',
      notice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors
        ? Object.keys(error.errors).map((key) => ({
            field: key,
            message: error.errors[key].message,
          }))
        : [],
    });
  }
};

// Delete Notice
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByIdAndDelete(id);

    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notice deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};