import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import { fetchUrls } from './services'; // Adjust the import path according to your folder structure
import styles from './dashboard.module.css';

const Dashboard = () => {
  const [clicksByDate, setClicksByDate] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = String(date.getFullYear()).slice(-2); // Get last two digits of the year
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUrls(); // Fetch the URLs from your backend
        const groupedClicks = data.reduce((acc, url) => {
          const date = formatDate(url.createdAt);

          // Initialize the date entry if not already present
          if (!acc[date]) {
            acc[date] = {
              totalClicks: 0,
              mobileClicks: 0,
              tabletClicks: 0,
              desktopClicks: 0,
            };
          }

          // Update click counts by device type
          acc[date].totalClicks += url.clickCount;
          acc[date].mobileClicks += url.deviceClicks?.mobile || 0;
          acc[date].tabletClicks += url.deviceClicks?.tablet || 0;
          acc[date].desktopClicks += url.deviceClicks?.desktop || 0;

          return acc;
        }, {});

        let runningTotal = 0;

        const accumulatedClicks = Object.entries(groupedClicks)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .map(([date, { totalClicks, mobileClicks, tabletClicks, desktopClicks }]) => {
            // Add the running total of previous days to the current day
            runningTotal += totalClicks;
            return {
              date,
              totalClicks: runningTotal,
              mobileClicks,
              tabletClicks,
              desktopClicks,
            };
          });

        setClicksByDate(accumulatedClicks);
      } catch (error) {
        console.error('Error fetching URLs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Get the total clicks (last entry in the accumulated data)
  const totalClicks = clicksByDate.length > 0 ? clicksByDate[clicksByDate.length - 1].totalClicks : 0;

  const deviceData = [
    {
      type: 'Mobile',
      count: clicksByDate.reduce((sum, item) => sum + item.mobileClicks, 0),
    },
    {
      type: 'Desktop',
      count: clicksByDate.reduce((sum, item) => sum + item.desktopClicks, 0),
    },
    {
      type: 'Tablet',
      count: clicksByDate.reduce((sum, item) => sum + item.tabletClicks, 0),
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.title}>
        Total Counts:
        <span className={styles.tcs}>{totalClicks}</span>
      </h2>
      <div className={styles.chartSection}>
        {/* Clicks Bar Chart Container */}
        <div className={styles.clicksChartContainer}>
          <h3>Date-wise Clicks</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={clicksByDate}
              layout="vertical"
              margin={{ top: 10, right: 50, left: 50, bottom: 10 }}
              className={styles.br1}
            >
              <YAxis
                type="category"
                dataKey="date"
                width={100}
                tick={{ fontSize: 17, fill: '#333' }}
                axisLine={false}
                tickLine={false}
              />
              <XAxis type="number" hide />
              <Bar dataKey="totalClicks" fill="#007bff" barSize={20}>
                <LabelList
                  dataKey="totalClicks"
                  position="right"
                  fill="#333"
                  fontSize={17}
                  fontWeight="bold"
                  className={styles.br2}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device Type Bar Chart Container */}
        <div className={styles.deviceChartContainer}>
          <h3>Click Devices</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={deviceData}
              layout="vertical"
              margin={{ top: 10, right: 50, left: 50, bottom: 10 }}
            >
              <YAxis
                type="category"
                dataKey="type"
                width={100}
                tick={{ fontSize: 17, fill: '#333' }}
                axisLine={false}
                tickLine={false}
              />
              <XAxis type="number" hide />
              <Bar dataKey="count" fill="#007bff" barSize={20}>
                {/* Display click count to the right of each bar */}
                <LabelList
                  dataKey="count"
                  position="right"
                  fill="#333"
                  fontSize={17}
                  fontWeight="bold"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
