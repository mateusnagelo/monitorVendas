import { useState, useContext, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import axios from 'axios';
import { DbContext } from './DbContext';
import type { DbConfig } from './DbContext';

interface ConfigScreenProps {
  onConfigSaved: () => void;
}

function ConfigScreen({ onConfigSaved }: ConfigScreenProps) {
  const [config, setConfig] = useState<DbConfig>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState('local');
  const context = useContext(DbContext);

  useEffect(() => {
    if (context?.dbConfig) {
      setConfig(context.dbConfig);
    }
  }, [context?.dbConfig]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setConfig((prevConfig) => ({
      ...prevConfig,
      [name]: name === 'port' ? parseInt(value, 10) : value,
    }));
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue);
  };

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.post('/.netlify/functions/test-connection', config);
      setSuccess(true);
    } catch (err: any) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || 'Falha na conexão com o banco de dados';
      const configUsed = errorData?.configUsed ? `\nConfiguração utilizada: ${JSON.stringify(errorData.configUsed)}` : '';
      setError(`${errorMessage}${configUsed}`);
    } finally {
      setLoading(false);
    }
  };

  const saveAndApply = () => {
    localStorage.setItem('dbConfig', JSON.stringify(config));
    context?.setDbConfig(config);
    onConfigSaved();
  };

  const handleLogout = () => {
    localStorage.removeItem('dbConfig');
    context?.setDbConfig(null);
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Configurações do Banco de Dados</Typography>
      <Tabs value={tab} onChange={handleTabChange} centered>
        <Tab label="LOCAL" value="local" />
        <Tab label="CLOUD" value="cloud" />
      </Tabs>

      <TextField
        label="Host"
        name="host"
        value={config.host || ''}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Porta"
        name="port"
        type="number"
        value={config.port || ''}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Usuário"
        name="user"
        value={config.user || ''}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Senha"
        name="password"
        type="password"
        value={config.password || ''}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
      />
      <TextField
        label="Banco de Dados"
        name="database"
        value={config.database || ''}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
      />

      <Button
        onClick={testConnection}
        variant="outlined"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Testando...' : 'Testar Conexão'}
      </Button>
      <Button
        onClick={saveAndApply}
        variant="contained"
        disabled={!success}
      >
        Salvar e Aplicar
      </Button>

      {context?.dbConfig && (
        <Button onClick={handleLogout} variant="outlined" color="error">
          Esquecer Conexão
        </Button>
      )}

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Conexão bem-sucedida!</Alert>}
    </Box>
  );
}

export default ConfigScreen;