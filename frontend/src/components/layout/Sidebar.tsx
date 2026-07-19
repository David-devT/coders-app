import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '@/components/ui/button';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard/coders', label: 'Coders' },
    { to: '/dashboard/clans', label: 'Clans' },
    { to: '/dashboard/team-leaders', label: 'Team Leaders', adminOnly: true },
  ];

  return (
    <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
          {user?.name?.charAt(0) || '?'}
        </div>
        <div>
          <p className="font-medium text-sm">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{'role' in (user || {}) ? (user as { role: string }).role : 'Coder'}</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {links
          .filter((l) => !l.adminOnly || ('role' in (user || {}) && (user as { role: string }).role === 'admin'))
          .map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
      </nav>
      <div className="mt-auto">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
