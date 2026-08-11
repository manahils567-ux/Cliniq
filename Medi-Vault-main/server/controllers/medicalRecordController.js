const MedicalRecord = require('../models/MedicalRecord');
const { upload, cloudinary } = require('../middleware/upload');
const CryptoJS = require('crypto-js');
const mongoose = require('mongoose');

// Encrypt data before saving
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, process.env.ENCRYPTION_KEY).toString();
};

// Decrypt data for retrieval
const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, process.env.ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

exports.uploadMedicalRecord = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title = req.file.originalname, description = 'Uploaded medical record', date = new Date(), category = 'Other' } = req.body;
    
    // Create new medical record with Cloudinary URL
    const newRecord = new MedicalRecord({
      userId: req.user._id, // Using _id consistently
      title: encryptData(title || ''),
      description: encryptData(description || ''),
      date: date || new Date(),
      category: category,
      fileUrl: req.file.path,
      publicId: req.file.filename
    });

    await newRecord.save();

    // Return decrypted data in the response
    const responseRecord = {
      id: newRecord._id,
      title: title,
      description: description,
      date: newRecord.date,
      category: newRecord.category,
      fileUrl: newRecord.fileUrl,
      publicId: newRecord.publicId
    };

    res.status(201).json({ 
      message: 'Medical record uploaded successfully', 
      record: responseRecord 
    });
  } catch (error) {
    console.error('Error in uploadMedicalRecord:', error);
    res.status(500).json({ message: 'Error uploading medical record', error: error.message });
  }
};

exports.deleteMedicalRecord = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid record ID' });
    }

    // Find the record and ensure it belongs to the user
    const record = await MedicalRecord.findOne({ 
      _id: req.params.id, 
      userId: req.user._id  // Using _id consistently
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Extract the public ID correctly from the Cloudinary URL
    let publicId;
    if (record.fileUrl) {
      // Extract public ID from the URL path
      // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/medi-vault/abc123def456
      const urlParts = record.fileUrl.split('/');
      const fileNameWithExtension = urlParts[urlParts.length - 1];
      const fileName = fileNameWithExtension.split('.')[0];
      publicId = `medi-vault/${fileName}`;
      
      // If we have a stored publicId, use that instead
      if (record.publicId) {
        publicId = record.publicId;
      }
      
      console.log('Attempting to delete file with public ID:', publicId);
      
      try {
        // Delete file from Cloudinary
        const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary delete result:', cloudinaryResult);
      } catch (cloudinaryError) {
        console.error('Error deleting file from Cloudinary:', cloudinaryError);
        // Continue with record deletion even if Cloudinary deletion fails
      }
    }

    // Delete the record from database
    await MedicalRecord.findByIdAndDelete(record._id);
    
    res.status(200).json({ 
      message: 'Medical record deleted successfully',
      deletedRecordId: record._id
    });
  } catch (error) {
    console.error('Error in deleteMedicalRecord:', error);
    res.status(500).json({ 
      message: 'Error deleting medical record', 
      error: error.message 
    });
  }
};

// Get all medical records for a user
exports.getMedicalRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ userId: req.user._id }); // Using _id consistently
    
    // Decrypt sensitive data before sending
    const decryptedRecords = records.map(record => ({
      ...record._doc,
      title: decryptData(record.title),
      description: decryptData(record.description)
    }));

    res.json(decryptedRecords);
  } catch (error) {
    console.error('Error in getMedicalRecords:', error);
    res.status(500).json({ message: 'Error retrieving medical records', error: error.message });
  }
};

// Get a single medical record
exports.getMedicalRecord = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid record ID' });
    }

    const record = await MedicalRecord.findOne({ 
      _id: req.params.id, 
      userId: req.user._id  // Using _id consistently
    });
    
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Decrypt sensitive data
    const decryptedRecord = {
      ...record._doc,
      title: decryptData(record.title),
      description: decryptData(record.description)
    };

    res.json(decryptedRecord);
  } catch (error) {
    console.error('Error in getMedicalRecord:', error);
    res.status(500).json({ message: 'Error retrieving medical record', error: error.message });
  }
};