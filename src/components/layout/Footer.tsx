import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Enterprise', href: '/enterprise' },
    { label: 'AI Editor', href: '/dashboard' },
  ],
  Solutions: [
    { label: 'Video Editing', href: '/dashboard' },
    { label: 'Social Content', href: '/' },
    { label: 'Brand Identity', href: '/brand-identity' },
    { label: 'Virality Strategy', href: '/virality' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Tutorials', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Community', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Press', href: '#' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="/lovable-uploads/viralin-logo.png" 
                alt="Viralin Logo" 
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              AI-powered video editing platform that helps creators produce viral content in minutes.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Viralin. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
