import { useState, useMemo, useContext, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Link,
} from '@mui/material';
import { Settings, Home, Assessment } from '@mui/icons-material';
import DashboardMetrics from './DashboardMetrics.tsx';
import ConfigScreen from './ConfigScreen.tsx';
import QueryScreen from './QueryScreen.tsx';
import { DbContext } from './DbContext';
import type { DbConfig } from './DbContext';
import { useIsMobile } from './useIsMobile.ts';

function App() {
  const { dbConfig } = useContext(DbContext);
  const [currentView, setCurrentView] = useState('main');
  const isMobile = useIsMobile();

  const handleNavigationChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentView(newValue);
  };

  const renderContent = () => {
    if (!dbConfig) {
      return <ConfigScreen onConfigSaved={() => setCurrentView('main')} />;
    }

    switch (currentView) {
      case 'config':
        return <ConfigScreen onConfigSaved={() => setCurrentView('main')} />;
      case 'query':
        return <QueryScreen />;
      case 'main':
      default:
        return <DashboardMetrics />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ConsultasApp
          </Typography>
          {!isMobile && (
            <>
              <IconButton color="inherit" onClick={() => setCurrentView('main')}>
                <Home />
              </IconButton>
              <IconButton color="inherit" onClick={() => setCurrentView('config')}>
                <Settings />
              </IconButton>
              <IconButton color="inherit" onClick={() => setCurrentView('query')}>
                <Assessment />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ flexGrow: 1, mt: 4, mb: isMobile ? 8 : 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderContent()}
      </Container>

      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={currentView}
            onChange={handleNavigationChange}
          >
            <BottomNavigationAction label="Início" value="main" icon={<Home />} />
            <BottomNavigationAction label="Ajustes" value="config" icon={<Settings />} />
            <BottomNavigationAction label="Consulta" value="query" icon={<Assessment />} />
          </BottomNavigation>
        </Paper>
      )}

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            <Link color="inherit" href="https://github.com/mateusnagelo" target="_blank" rel="noopener">
              vr 1.0.0 - Desenvolvido por VisionApp by Mateus Angelo
            </Link>
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

function DbProvider() {
  const [dbConfig, setDbConfig] = useState<DbConfig | null>(null);
  const contextValue = useMemo(() => ({ dbConfig, setDbConfig }), [dbConfig]);

  useEffect(() => {
    const savedConfig = localStorage.getItem('dbConfig');
    if (savedConfig) {
      try {
        setDbConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse dbConfig from localStorage", e);
      }
    }
  }, []);

  return (
    <DbContext.Provider value={contextValue}>
      <App />
    </DbContext.Provider>
  );
}

export default DbProvider;