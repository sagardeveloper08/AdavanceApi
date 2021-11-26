const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        default: 0.0
    },
    description: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: true,
        enum: {
            values: [
                'electronics',
                'cameras',
                'Laptop',
                'Accesssories',
                'Books',
                'food',
                'clothes',
                'Home',
            ]
        }
    },
    seller: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    numbOfReviews: {
        type: Number
    },
    reviews: [{
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    }],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

productSchema.index({ request: 'name' });
module.exports = mongoose.model('Products', productSchema)