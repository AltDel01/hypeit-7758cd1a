import React from 'react';
import { Play, Eye, Heart, MessageCircle, Sparkles } from 'lucide-react';

const showcaseItems = [
  {
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=600&fit=crop',
    title: 'Product Launch Video',
    views: '2.4M',
    likes: '184K',
    category: 'E-commerce',
  },
  {
    thumbnail: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=600&fit=crop',
    title: 'Travel Vlog Edit',
    views: '1.8M',
    likes: '156K',
    category: 'Travel',
  },
  {
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=600&fit=crop',
    title: 'Fitness Tutorial',
    views: '3.2M',
    likes: '245K',
    category: 'Fitness',
  },
  {
    thumbnail: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=600&fit=crop',
    title: 'Tech Review',
    views: '890K',
    likes: '67K',
    category: 'Tech',
  },
  {
    thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=600&fit=crop',
    title: 'Recipe Short',
    views: '4.1M',
    likes: '312K',
    category: 'Food',
  },
  {
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
    title: 'Music Promo',
    views: '1.5M',
    likes: '98K',
    category: 'Music',
  },
];

const ShowcaseGallery: React.FC = () => {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4 md:mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Showcase</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Made with{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
              Viralin
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            See what creators are building with our AI video editor
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {showcaseItems.map((item, index) => (
            <div
              key={index}
              className="group relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Thumbnail */}
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
              </div>
              
              {/* Category badge */}
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                  {item.category}
                </span>
              </div>
              
              {/* Stats */}
              <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium mb-2 line-clamp-1">{item.title}</p>
                <div className="flex items-center gap-3 text-gray-300 text-xs">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {item.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View more link */}
        <div className="text-center mt-8">
          <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors">
            <MessageCircle className="w-4 h-4" />
            Join our community
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseGallery;
