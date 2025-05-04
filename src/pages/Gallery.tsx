import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Slide1 from './Slide1.jpg';
import Slide2 from './Slide2.jpg';
import Slide3 from './Slide3.jpg';

// Image data with imported local images
const images = [
  { id: 1, src: Slide1, alt: 'Slide 1' },
  { id: 2, src: Slide2, alt: 'Slide 2' },
  { id: 3, src: Slide3, alt: 'Slide 3' },
];

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openLightbox = (src: string) => {
    setSelectedImage(src);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <div className="bg-navy-900 min-h-screen py-16 text-white">
      <div className="container mx-auto px-6">
        <h1 className="text-5xl font-extrabold text-center text-purple-800 mb-12 animate-pulse">Gallery</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-gray-800 border-4 border-navy-600 rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={() => openLightbox(image.src)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover"
              />
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/" className="text-white hover:text-navy-600 text-xl font-semibold underline transition-colors duration-300">
            Back to Home
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full">
            <img
              src={selectedImage}
              alt="Full-size view"
              className="w-full h-auto rounded-lg"
            />
            <button
              className="absolute top-4 right-4 text-white bg-navy-600 hover:bg-navy-700 rounded-full p-2"
              onClick={closeLightbox}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;