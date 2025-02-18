import { Schema, model } from "mongoose";

const courseSchema = new Schema({
    nameCourse: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    teacher: { 
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true
    }],
    status: {
        type: Boolean,
        default: true
    }
}, 
    { 
        timestamps: true, 
        versionKey: false 
    }
);

export default model('Course', courseSchema);