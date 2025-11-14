import { useState, useContext } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import axios from 'axios';
import { DbContext } from './DbContext';
import type { DbConfig } from './DbContext';

function QueryScreen() {
  const [query, setQuery] = useState('SELECT * FROM NFE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const context = useContext(DbContext);

  const executeQuery = async () => {
    if (!context?.dbConfig) {
      setError('A configuração do banco de dados não foi encontrada.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('/.netlify/functions/execute-query', {
        dbConfig: context.dbConfig,
        query,
      });
      setResults(response.data.results);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Falha ao executar a consulta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5">Executar Consulta SQL</Typography>
      <TextField
        label="Consulta SQL"
        multiline
        rows={4}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        variant="outlined"
        fullWidth
      />
      <Button
        onClick={executeQuery}
        variant="contained"
        disabled={loading || !query}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Executando...' : 'Executar'}
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
      {results && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {results.length > 0 &&
                  Object.keys(results[0]).map((key) => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((row, index) => (
                <TableRow key={index}>{
                  Object.values(row).map((value: any, i) => (
                    <TableCell key={i}>{String(value)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default QueryScreen;