'use client'

// Next Imports
import { useEffect, useState } from 'react'

import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Function to generate random soft colors
const generateSoftColors = (count: number): string[] => {
  const colors: string[] = []

  for (let i = 0; i < count; i++) {
    const hue = Math.floor(Math.random() * 360)
    const saturation = Math.floor(Math.random() * 20) + 50 // 50-70%
    const lightness = Math.floor(Math.random() * 15) + 70 // 70-85%

    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
  }

  return colors
}

type DataType = {
  title: string
  value: number
  color: string
}

const InterestedTopics = () => {
  // Hooks
  const theme = useTheme()

  const [records, setRecords] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes] = await Promise.all([fetch('/api/record/by-category')])

        const recordsData = await recordsRes.json()

        setRecords(recordsData)
      } catch (error) {
        console.error('Failed to fetch data', error)
      }
    }

    fetchData()
  }, [])

  const recordsByCategory = records

  const labels = recordsByCategory.map(obj => obj.categoryName)

  const chartColors = generateSoftColors(recordsByCategory.length)

  const dataRecords: DataType[] = []
  const totalCount = recordsByCategory.reduce((accumulator, record) => accumulator + record.recordCount, 0)

  for (let i = 0; i < recordsByCategory.length; i++) {
    dataRecords.push({
      title: recordsByCategory[i].categoryName,
      value: parseInt((recordsByCategory[i].recordCount * 100) / totalCount),
      color: chartColors[i]
    })
  }

  const data: DataType[] = dataRecords

  // Vars
  const series = [
    {
      data: recordsByCategory.map(obj => obj.recordCount)
    }
  ]

  // Vars
  const options: ApexOptions = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true,
        borderRadius: 7,
        borderRadiusApplication: 'end'
      }
    },

    colors: chartColors,
    grid: {
      strokeDashArray: 8,
      borderColor: 'var(--mui-palette-divider)',
      xaxis: {
        lines: { show: true }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: -30,
        left: 21,
        right: 25,
        bottom: -5
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: 8,
      style: {
        colors: ['#232323'],
        fontWeight: 500,
        fontSize: '0.7125rem'
      },
      formatter(val: string, opt: any) {
        return labels[opt.dataPointIndex]
      }
    },
    tooltip: {
      enabled: true,
      style: {
        fontSize: '0.75rem'
      },
      onDatasetHover: {
        highlightDataSeries: false
      }
    },
    legend: { show: false },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    xaxis: {
      axisTicks: { show: false },
      axisBorder: { show: false },
      categories: recordsByCategory.map(obj => obj.recordCount),
      labels: {
        formatter: val => `${val}%`,
        style: {
          fontSize: '0.8125rem',
          colors: 'var(--mui-palette-text-disabled)'
        }
      }
    },
    yaxis: {
      labels: {
        align: theme.direction === 'rtl' ? 'right' : 'left',
        style: {
          fontWeight: 500,
          fontSize: '0.8125rem',
          colors: 'var(--mui-palette-text-disabled)'
        },
        offsetX: theme.direction === 'rtl' ? -15 : -30
      }
    }
  }

  return (
    <Card>
      <CardHeader title='Top by category' />
      <CardContent>
        <Grid container>
          <Grid size={{ xs: 12, sm: 6 }} className='max-sm:mbe-6'>
            <AppReactApexCharts type='bar' height={302} width='100%' series={series} options={options} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <div className='flex justify-around items-start'>
              <div className='flex flex-col gap-y-12'>
                {data.map((item, i) => (
                  <div key={i} className='flex gap-2'>
                    <i className='ri-circle-fill text-xs m-[5px]' style={{ color: item.color }} />
                    <div>
                      <Typography>{item.title}</Typography>
                      <Typography variant='h5'>{`${item.value}%`}</Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default InterestedTopics
