import mongoose, { Schema, model, models, Document, Model } from 'mongoose';

export interface IBookmark extends Document {
    title: string;
    url: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>({
    title: {
        type: String,
        required: [true, 'Please provide a title for this bookmark.'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    url: {
        type: String,
        required: [true, 'Please provide a URL for this bookmark.'],
        validate: {
            validator: function (v: string) {
                return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(v);
            },
            message: (props: any) => `${props.value} is not a valid URL!`
        },
    },
    tags: {
        type: [String],
        default: [],
    },
}, {
    timestamps: true,
});

const Bookmark: Model<IBookmark> = models.Bookmark || model<IBookmark>('Bookmark', BookmarkSchema);
export default Bookmark;
