import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography, Box, useTheme } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RejectionChartProps {
  data: { [monthYear: string]: number }; // e.g., {"2024-01": 5, "2024-02": 3}
}

const RejectionChart: React.FC<RejectionChartProps> = ({ data }) => {
  const theme = useTheme();

  // Sort data by month-year chronologically
  const sortedMonths = Object.keys(data).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const chartLabels = sortedMonths.map(monthYear => {
    const [year, month] = monthYear.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
  });
  const chartDataValues = sortedMonths.map(monthYear => data[monthYear]);

  const chartJsData: ChartData<'bar'> = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Rejections per Month',
        data: chartDataValues,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(100, 149, 237, 0.7)' : 'rgba(75, 192, 192, 0.6)',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(100, 149, 237, 1)' : 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false, // Important for sizing in a container
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme.palette.text.secondary,
          stepSize: 1, // Ensure integer ticks for counts
        },
        grid: {
          color: theme.palette.divider,
        },
      },
      x: {
        ticks: {
          color: theme.palette.text.secondary,
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme.palette.text.primary,
        }
      },
      title: {
        display: true,
        text: 'Monthly Rejection Trends',
        color: theme.palette.text.primary,
        font: {
          size: 16,
        }
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.primary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
      }
    },
  };

  if (Object.keys(data).length === 0) {
    return (
      <Paper className="apple-style-card" sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6">Monthly Rejection Trends</Typography>
        <Typography>No rejection data yet to display the chart.</Typography>
      </Paper>
    );
  }

  return (
    <Paper className="apple-style-card" sx={{ p: 2, height: { xs: 300, sm: 400} /* Responsive height */ }}>
      <Box sx={{ height: '100%' }}>
        <Bar options={options} data={chartJsData} />
      </Box>
    </Paper>
  );
};

export default RejectionChart; 