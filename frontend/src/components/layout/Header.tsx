import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';
import { LogOut, User, Home, Shield, Palette, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const themes = [
  { id: 'light', name: '☀️ Light', class: 'theme-light' },
  { id: 'dark', name: '🌙 Dark', class: 'theme-dark' },
  { id: 'midnight', name: '🌌 Midnight Blue', class: 'theme-midnight' },
  { id: 'ocean', name: '🌊 Ocean', class: 'theme-ocean' },
  { id: 'sunset', name: '🌅 Sunset', class: 'theme-sunset' },
  { id: 'forest', name: '🌲 Forest', class: 'theme-forest' },
  { id: 'cyberpunk', name: '🤖 Cyberpunk', class: 'theme-cyberpunk' },
];

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    // Remove all theme classes
    document.documentElement.classList.remove('dark', ...themes.map(t => t.class));
    
    // Add new theme class
    document.documentElement.classList.add(theme.class);
    
    // Also add 'dark' class for dark themes (for Tailwind dark: variants)
    if (themeId !== 'light') {
      document.documentElement.classList.add('dark');
    }
  };

  const changeTheme = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem('theme', themeId);
    applyTheme(themeId);
    setIsThemeOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentThemeData = themes.find(t => t.id === currentTheme);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/home" className="flex items-center space-x-2">
          <span className="text-2xl">🎯</span>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            QuizCraft
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          <Link to="/home">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>

          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>

          {user?.role === 'admin' && (
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          )}

          {/* Theme Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="flex items-center gap-1"
            >
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">{currentThemeData?.name.split(' ')[0]}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isThemeOpen ? 'rotate-180' : ''}`} />
            </Button>

            {isThemeOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-popover shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95">
                <div className="p-1">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => changeTheme(theme.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                        currentTheme === theme.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-secondary'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
}