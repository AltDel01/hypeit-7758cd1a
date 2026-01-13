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
    <section className="relative py-6 md:py-12 px-3 md:px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6 md:mb-12">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 mb-3 md:mb-6">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-400" />
            <span className="text-xs md:text-sm font-medium text-purple-300">Showcase</span>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
            Made with{' '}
            <span className="bg-gradient-to-r from-[#8c52ff] to-[#b616d6] bg-clip-text text-transparent">
              Viralin
            </span>
          </h2>
          <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto px-2">
            See what creators are building with our AI video editor
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
          {showcaseItems.map((item, index) => (
            <div
              key={index}
              className="group relative aspect-[9/16] rounded-lg md:rounded-xl overflow-hidden cursor-pointer"
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
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-white" />
                </div>
              </div>
              
              {/* Category badge */}
              <div className="absolute top-2 left-2 md:top-3 md:left-3">
                <span className="px-1.5 md:px-2 py-0.5 md:py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] md:text-xs font-medium">
                  {item.category}
                </span>
              </div>
              
              {/* Stats */}
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs md:text-sm font-medium mb-1 md:mb-2 line-clamp-1">{item.title}</p>
                <div className="flex items-center gap-2 md:gap-3 text-gray-300 text-[10px] md:text-xs">
                  <span className="flex items-center gap-1">
                    <Eye className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    {item.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    {item.likes}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View more link */}
        <div className="text-center mt-6 md:mt-8">
          <button className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-[#25D366] text-white text-sm md:text-base font-medium hover:bg-[#1fb855] transition-colors">
            <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Join our community
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseGallery;
