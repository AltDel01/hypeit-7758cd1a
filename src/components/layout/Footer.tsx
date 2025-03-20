
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-12 border-t border-brand-slate-200">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-gradient-to-br from-brand-blue to-brand-teal rounded-lg flex items-center justify-center text-white font-bold">
                B
              </div>
              <span className="text-xl font-semibold">BrandGen</span>
            </div>
            
            <p className="text-brand-slate-600 max-w-xs">
              AI-powered branding and social media content creation for small businesses and entrepreneurs.
            </p>
            
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
              <SocialLink href="#" icon={<Facebook size={18} />} label="Facebook" />
              <SocialLink href="#" icon={<Instagram size={18} />} label="Instagram" />
              <SocialLink href="#" icon={<Linkedin size={18} />} label="LinkedIn" />
            </div>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-brand-slate-900 uppercase tracking-wider mb-4">
              Company
            </h3>
            <div className="flex flex-col space-y-3">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/careers">Careers</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </div>
          </div>
          
          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-brand-slate-900 uppercase tracking-wider mb-4">
              Product
            </h3>
            <div className="flex flex-col space-y-3">
              <FooterLink to="/features">Features</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/testimonials">Testimonials</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/roadmap">Roadmap</FooterLink>
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-brand-slate-900 uppercase tracking-wider mb-4">
              Contact
            </h3>
            <div className="flex flex-col space-y-3">
              <div className="flex items-start">
                <MapPin size={18} className="text-brand-slate-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-brand-slate-600 text-sm">
                  123 Branding Street, Suite 100, San Francisco, CA 94103
                </span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="text-brand-slate-400 mr-2 flex-shrink-0" />
                <span className="text-brand-slate-600 text-sm">
                  +1 (555) 123-4567
                </span>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="text-brand-slate-400 mr-2 flex-shrink-0" />
                <span className="text-brand-slate-600 text-sm">
                  support@brandgen.com
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-brand-slate-200 pt-8 mt-12">
          <p className="text-sm text-brand-slate-500 text-center">
            © {new Date().getFullYear()} BrandGen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ 
  href, 
  icon, 
  label 
}: { 
  href: string; 
  icon: React.ReactNode;
  label: string;
}) => {
  return (
    <a
      href={href}
      aria-label={label}
      className="text-brand-slate-500 hover:text-brand-blue transition-colors duration-300"
    >
      {icon}
    </a>
  );
};

const FooterLink = ({ 
  to, 
  children 
}: { 
  to: string; 
  children: React.ReactNode;
}) => {
  return (
    <Link
      to={to}
      className="text-brand-slate-600 hover:text-brand-blue text-sm transition-colors duration-200"
    >
      {children}
    </Link>
  );
};

export default Footer;
