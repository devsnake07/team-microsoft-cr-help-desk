'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import Paper from '@mui/material/Paper'
import type { GridColDef } from '@mui/x-data-grid'
import { DataGrid } from '@mui/x-data-grid'
import IconButton from '@mui/material/IconButton'

// Type Imports
import type { User } from '@prisma/client'

const paginationModel = { page: 0, pageSize: 5 }

const Main = () => {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/user')
        const data = await res.json()

        setUsers(data)
      } catch (error) {
        console.error('Failed to fetch users', error)
      }
    }

    fetchCategories()
  }, [])

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 200, flex: 1 },
    {
      field: 'createdAt',
      headerName: 'Join Us',
      width: 180,
      valueFormatter: params => new Date(params).toLocaleString()
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: params => (
        <IconButton onClick={() => handleDelete(params.row.id)} size='small'>
          <i className='ri-delete-bin-line' />
        </IconButton>
      )
    }
  ]

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const res = await fetch(`/api/user/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setUsers(prev => prev.filter(user => user.id !== id))
      } else {
        console.error('Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user', error)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 12 }}>
        <Card>
          <CardContent>
            <Paper sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={users}
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
  )
}

export default Main
