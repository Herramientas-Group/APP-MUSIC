import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import type { Artist, ReleaseGroup } from '../types/musicbrainz';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface ChartsProps {
  artist: Artist;
  albums: ReleaseGroup[];
}

export function Charts({ artist, albums }: ChartsProps) {
  const yearCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  const tags = (artist.tags || []).sort((a, b) => b.count - a.count).slice(0, 8);

  albums.forEach((rg) => {
    const year = rg['first-release-date']?.slice(0, 4);
    if (year && !isNaN(Number(year))) {
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
    const type = rg['primary-type'] || 'Otro';
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const years = Object.keys(yearCounts).sort().slice(-10);
  const yearData = years.map((y) => yearCounts[y]);

  const typeLabels = Object.keys(typeCounts);
  const typeData = Object.values(typeCounts);
  const typeColors = ['#7c6af7', '#e05c97', '#3ecf8e', '#f59e0b', '#f87171', '#60b4f5'];

  const tagLabels = tags.map((t) => t.name);
  const tagCounts = tags.map((t) => t.count);
  const maxTagCount = Math.max(...tagCounts, 1);
  const tagData = tagCounts.map((c) => (c / maxTagCount) * 100);

  const yearsSorted = Object.keys(yearCounts).sort();
  const latestYear = yearsSorted.length > 0 ? yearsSorted[yearsSorted.length - 1] : '—';
  const earliestYear = yearsSorted.length > 0 ? yearsSorted[0] : '—';
  const yearSpan = yearsSorted.length > 1
    ? parseInt(latestYear) - parseInt(earliestYear)
    : 0;

  const albumCount = typeCounts['Album'] || 0;
  const singleCount = (typeCounts['Single'] || 0) + (typeCounts['EP'] || 0);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#2e2e3e' }, ticks: { color: '#8884a8' } },
      y: { grid: { color: '#2e2e3e' }, ticks: { color: '#8884a8', stepSize: 1 }, beginAtZero: true },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: { color: '#8884a8', padding: 12, font: { size: 11 } },
      },
    },
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#2e2e3e' }, ticks: { color: '#8884a8' }, max: 100 },
      y: { grid: { display: false }, ticks: { color: '#f0eeff', font: { size: 11 } } },
    },
  };

  return (
    <div className="charts-section">
      <div className="stats-row">
        <div className="mini-stat">
          <div className="mini-stat-icon purple">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <div className="mini-stat-content">
            <span className="mini-stat-label">Más activo</span>
            <span className="mini-stat-value">{latestYear}</span>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon pink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="mini-stat-content">
            <span className="mini-stat-label">Carrera</span>
            <span className="mini-stat-value">{yearSpan > 0 ? `${yearSpan} años` : '—'}</span>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div className="mini-stat-content">
            <span className="mini-stat-label">Álbumes</span>
            <span className="mini-stat-value">{albumCount}</span>
          </div>
        </div>
        <div className="mini-stat">
          <div className="mini-stat-icon amber">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="mini-stat-content">
            <span className="mini-stat-label">Singles/EP</span>
            <span className="mini-stat-value">{singleCount}</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Álbumes por año</div>
          <div className="chart-container">
            <Bar
              data={{
                labels: years,
                datasets: [{
                  label: 'Álbumes',
                  data: yearData,
                  backgroundColor: '#7c6af7',
                  borderRadius: 4,
                  barThickness: 24,
                }],
              }}
              options={barOptions}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Tipos de publicación</div>
          <div className="chart-container">
            <Doughnut
              data={{
                labels: typeLabels,
                datasets: [{
                  data: typeData,
                  backgroundColor: typeColors.slice(0, typeLabels.length),
                  borderWidth: 0,
                }],
              }}
              options={doughnutOptions}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Géneros principales</div>
          <div className="chart-container">
            <Bar
              data={{
                labels: tagLabels,
                datasets: [{
                  label: 'Frecuencia',
                  data: tagData,
                  backgroundColor: '#e05c97',
                  borderRadius: 4,
                }],
              }}
              options={horizontalBarOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
