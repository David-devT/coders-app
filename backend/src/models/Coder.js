import mongoose from 'mongoose';

const coderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  clan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clan',
    required: false
  }
}, {
  timestamps: true
});

coderSchema.set('toJSON', { virtuals: true });
coderSchema.set('toObject', { virtuals: true });

const Coder = mongoose.model('Coder', coderSchema);

export default Coder;
