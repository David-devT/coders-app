import mongoose from 'mongoose';

const clanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Clan name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  teamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamLeader',
    required: false
  }
}, {
  timestamps: true
});

clanSchema.virtual('coders', {
  ref: 'Coder',
  localField: '_id',
  foreignField: 'clan'
});

clanSchema.set('toJSON', { virtuals: true });
clanSchema.set('toObject', { virtuals: true });

const Clan = mongoose.model('Clan', clanSchema);

export default Clan;
