import mongoose, { Schema, model, models, Document, Model } from 'mongoose';

export interface INote extends Document {
    title: string;
    content: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema = new Schema<INote>({
    title: {
        type: String,
        required: [true, 'Please provide a title for this note.'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    content: {
        type: String,
        required: [true, 'Please provide content for this note.'],
    },
    tags: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});

const Note: Model<INote> = models.Note || model<INote>('Note', NoteSchema);
export default Note;
