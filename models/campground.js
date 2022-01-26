const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,  // cloudinary url
    filename: String  // to delete 
});

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});


const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {  // we use geojson because is a standard
        type: {
          type: String, 
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, { toJSON: { virtuals: true } });  // include virtuals when parsing to json

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {  // for mapbox cluster map
    return `
        <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
        <p>${this.description.substring(0, 20)}...</p>
    `;
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);