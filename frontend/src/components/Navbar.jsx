import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #eee' }}>
      <Toolbar sx={{ maxWidth: 700, width: '100%', mx: 'auto' }}>
        <ForumRoundedIcon color="primary" sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          3W Social
        </Typography>

        {user ? (
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
              {user.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user.username}
            </Typography>
            <Button size="small" onClick={handleLogout} color="error">
              Logout
            </Button>
          </Box>
        ) : (
          <Box display="flex" gap={1}>
            <Button onClick={() => navigate('/login')}>Login</Button>
            <Button variant="contained" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;