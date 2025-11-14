import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import { DbContext } from './DbContext';

interface MetricCardProps {
  title: string;
  data: Record<string, string | number>;
}

function MetricCard({ title, data }: MetricCardProps) {
  const formatValue = (value: string | number) => {
    if (typeof value === 'number' && title !== 'Quant. Atendimentos') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
    return value;
  };

  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {title}
        </Typography>
        {Object.entries(data).map(([key, value]) => (
          <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {key}:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {formatValue(value)}
            </Typography>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
}

function DashboardMetrics() {
  const [metrics, setMetrics] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const context = useContext(DbContext);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!context?.dbConfig) {
        setError('A configuração do banco de dados não foi encontrada. Por favor, configure a conexão primeiro.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const response = await axios.post('/.netlify/functions/dashboard-metrics', { dbConfig: context.dbConfig });
        setMetrics(response.data);
      } catch (error) {
        console.error('Erro ao buscar métricas do dashboard:', error);
        setError('Não foi possível carregar as métricas. Verifique a conexão e tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [context?.dbConfig]);

  if (!context?.dbConfig) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Por favor, configure a conexão com o banco de dados na tela de ajustes.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics) {
    // This state might be brief, but good to have for robustness
    return <Typography sx={{ mt: 2 }}>Sem métricas para exibir.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
      {metrics && Object.entries(metrics).map(([title, data]) => (
        <Box key={title} sx={{ flex: '1 1 300px', maxWidth: '350px' }}>
          <MetricCard title={title} data={data} />
        </Box>
      ))}
    </Box>
  );
}

export default DashboardMetrics;