import mongoose from 'mongoose';

const teamLeaderSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['teamLeader', 'admin'],
    default: 'teamLeader'
  }
}, {
  timestamps: true
});

teamLeaderSchema.virtual('clans', {
  ref: 'Clan',
  localField: '_id',
  foreignField: 'teamLeader'
});

teamLeaderSchema.set('toJSON', { virtuals: true });
teamLeaderSchema.set('toObject', { virtuals: true });

const TeamLeader = mongoose.model('TeamLeader', teamLeaderSchema);

export default TeamLeader;
