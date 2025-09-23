'use client'

import { useEffect, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid } from '@mui/x-data-grid'
import Paper from '@mui/material/Paper'
import InputAdornment from '@mui/material/InputAdornment'

import Box from '@mui/material/Box'

// Type Imports
import type { Binnacle } from '@prisma/client'

// Define a more specific type for the records we fetch, which include nested data
type FetchedRecord = Binnacle & {
  user: { name: string | null; email: string | null }
}

const paginationModel = { page: 0, pageSize: 10 }

const Main = () => {
  const [records, setRecords] = useState<FetchedRecord[]>([])

  // Global search state
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recordsRes] = await Promise.all([fetch('/api/binnacle')])

        const recordsData = await recordsRes.json()

        setRecords(recordsData)
      } catch (error) {
        console.error('Failed to fetch data', error)
      }
    }

    fetchData()
  }, [])

  const columns: GridColDef<FetchedRecord>[] = [
    { field: 'action', headerName: 'Action', width: 200 },
    {
      field: 'user',
      headerName: 'Member',
      width: 200,
      valueGetter: params => params.name
    },

    { field: 'details', headerName: 'Details', flex: 1 },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 180,
      valueFormatter: params => new Date(params).toLocaleString()
    }
  ]

  const filteredRecords = records.filter(record => {
    const searchTerm = searchText.toLowerCase()

    // Check against multiple fields for a match
    return (
      record.action.toLowerCase().includes(searchTerm) ||
      (record.user.name || '').toLowerCase().includes(searchTerm) ||
      record.details.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, md: 12 }}>
          <Card>
            <CardHeader
              title='Binnacle'
              action={
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <TextField
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder='Search ...'
                    size='small'
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='ri-search-line' />
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>
              }
            />
            <CardContent>
              <Paper sx={{ width: '100%' }}>
                <DataGrid
                  rows={filteredRecords}
                  columns={columns}
                  initialState={{ pagination: { paginationModel } }}
                  pageSizeOptions={[5, 10]}
                  sx={{ border: 0 }}
                />
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default Main
